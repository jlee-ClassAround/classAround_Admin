'use server';

import { ivyDb } from '@/lib/ivyDb';
import { OrderStatus, PaymentMethod, PaymentStatus, Prisma } from '@/generated/ivy';

export type LecturePaymentDetailRow = {
    paidAt: Date;

    orderId: string;
    orderNumber: string;
    orderStatus: OrderStatus;

    paymentId: string;
    tossPaymentKey: string | null;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;

    userId: string | null;
    buyerName: string | null;
    buyerEmail: string | null;
    buyerPhone: string | null;

    // ✅ 실제 결제된 강의 id / title (부모 페이지에서 자식 결제도 나오기 때문에 중요)
    courseId: string;
    courseTitle: string;

    itemPrice: number;

    paidAmount: number;
    refundAmount: number;
    netAmount: number;

    receiptUrl: string | null;

    // ✅ RefundAction에서 필요한 값
    tossCustomerId: string | null;

    // ✅ 표시용(없을 수 있음 → null 허용)
    refundableAmount: number | null;
};

export type GetLecturePaymentsParams = {
    courseId: string; // 여기 들어온 courseId를 "부모"로 보고, 자식 결제도 합쳐서 보여줌
    status?: string;
    type?: string;
    search?: string;
};

const PAYMENT_STATUS_SET = new Set<string>(Object.values(PaymentStatus));
const ORDER_STATUS_SET = new Set<string>(Object.values(OrderStatus));
const PAYMENT_METHOD_SET = new Set<string>(Object.values(PaymentMethod));

function itemFinalPrice(item: { discountedPrice: number | null; originalPrice: number }): number {
    return item.discountedPrice ?? item.originalPrice;
}

function uniq(arr: string[]): string[] {
    return Array.from(new Set(arr));
}

export async function getLecturePaymentsByOrder(
    params: GetLecturePaymentsParams
): Promise<{ rows: LecturePaymentDetailRow[] }> {
    const { courseId, status, type, search } = params;

    // ✅ 0) 부모(courseId)의 자식 강의 ids까지 포함
    const childCourses = await ivyDb.course.findMany({
        where: { parentId: courseId },
        select: { id: true },
    });

    const targetCourseIds = uniq([courseId, ...childCourses.map((c) => c.id)]);

    // ✅ 1) OrderItem 필터: courseId / productId 둘 다 커버 (너 DB 구조가 섞여있어서)
    const itemWhere: Prisma.OrderItemWhereInput = {
        productCategory: 'COURSE',
        OR: [{ courseId: { in: targetCourseIds } }, { productId: { in: targetCourseIds } }],
    };

    const statusUpper = (status ?? '').toUpperCase();
    const paymentStatusFilter: PaymentStatus | undefined = PAYMENT_STATUS_SET.has(statusUpper)
        ? (statusUpper as PaymentStatus)
        : undefined;
    const orderStatusFilter: OrderStatus | undefined = ORDER_STATUS_SET.has(statusUpper)
        ? (statusUpper as OrderStatus)
        : undefined;

    const methodUpper = (type ?? '').toUpperCase();
    const paymentMethodFilter: PaymentMethod | undefined = PAYMENT_METHOD_SET.has(methodUpper)
        ? (methodUpper as PaymentMethod)
        : undefined;

    const q = (search ?? '').trim();

    const where: Prisma.PaymentWhereInput = {
        ...(paymentStatusFilter ? { paymentStatus: paymentStatusFilter } : {}),
        ...(paymentMethodFilter ? { paymentMethod: paymentMethodFilter } : {}),
        order: {
            ...(orderStatusFilter ? { status: orderStatusFilter } : {}),
            orderItems: { some: itemWhere },
            ...(q
                ? {
                      OR: [
                          { orderNumber: { contains: q, mode: 'insensitive' } },
                          { orderName: { contains: q, mode: 'insensitive' } },
                          { user: { nickname: { contains: q, mode: 'insensitive' } } },
                          { user: { username: { contains: q, mode: 'insensitive' } } },
                          { user: { email: { contains: q, mode: 'insensitive' } } },
                          { user: { phone: { contains: q, mode: 'insensitive' } } },
                      ],
                  }
                : {}),
        },
    };

    const payments = await ivyDb.payment.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: {
            id: true,
            createdAt: true,
            tossPaymentKey: true,
            paymentMethod: true,
            paymentStatus: true,
            amount: true,
            cancelAmount: true,
            receiptUrl: true,
            order: {
                select: {
                    id: true,
                    orderNumber: true,
                    status: true,
                    user: {
                        select: {
                            id: true,
                            nickname: true,
                            username: true,
                            email: true,
                            phone: true,
                        },
                    },
                    orderItems: {
                        where: itemWhere,
                        select: {
                            // ✅ 어떤 강의로 결제된 건지 식별용
                            courseId: true,
                            productId: true,

                            productTitle: true,
                            originalPrice: true,
                            discountedPrice: true,
                        },
                        take: 1,
                    },
                },
            },
        },
    });

    // ✅ 2) Payment.tossPaymentKey(= TossCustomer.paymentKey)로 tossCustomerId / refundableAmount 매핑
    const paymentKeys = payments
        .map((p) => p.tossPaymentKey)
        .filter((k): k is string => typeof k === 'string' && k.length > 0);

    const tossCustomers = paymentKeys.length
        ? await ivyDb.tossCustomer.findMany({
              where: { paymentKey: { in: paymentKeys } },
              select: {
                  id: true,
                  paymentKey: true,
                  refundableAmount: true,
              },
          })
        : [];

    const tcMap = new Map<string, { id: string; refundableAmount: number | null }>();
    for (const tc of tossCustomers) {
        if (tc.paymentKey) {
            tcMap.set(tc.paymentKey, { id: tc.id, refundableAmount: tc.refundableAmount });
        }
    }

    const rows: LecturePaymentDetailRow[] = payments.map((p) => {
        const oi = p.order.orderItems[0];

        const realCourseId = (oi?.courseId ?? oi?.productId ?? courseId) as string;
        const title = oi?.productTitle ?? '(알 수 없음)';

        const buyerName = p.order.user?.username ?? null;

        const tc = p.tossPaymentKey ? tcMap.get(p.tossPaymentKey) : undefined;

        return {
            paidAt: p.createdAt,
            receiptUrl: p.receiptUrl,

            orderId: p.order.id,
            orderNumber: p.order.orderNumber,
            orderStatus: p.order.status,

            paymentId: p.id,
            tossPaymentKey: p.tossPaymentKey,
            paymentMethod: p.paymentMethod,
            paymentStatus: p.paymentStatus,

            userId: p.order.user?.id ?? null,
            buyerName,
            buyerEmail: p.order.user?.email ?? null,
            buyerPhone: p.order.user?.phone ?? null,

            // ✅ 부모 화면에서도 실제 결제된 강의(자식 포함)로 내려줌
            courseId: realCourseId,
            courseTitle: title,

            itemPrice: oi ? itemFinalPrice(oi) : 0,

            paidAmount: p.amount,
            refundAmount: p.cancelAmount ?? 0,
            netAmount: p.amount - (p.cancelAmount ?? 0),

            tossCustomerId: tc?.id ?? null,
            refundableAmount: tc?.refundableAmount ?? null,
        };
    });

    return { rows };
}
