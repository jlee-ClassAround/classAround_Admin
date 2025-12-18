'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import { OrderStatus, PaymentMethod, PaymentStatus, Prisma } from '@/generated/cojooboo';

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

    courseId: string;
    courseTitle: string;

    itemPrice: number;

    paidAmount: number;
    refundAmount: number;
    netAmount: number;

    receiptUrl: string | null;
};

export type GetLecturePaymentsParams = {
    courseId: string;
    status?: string; // PaymentStatus 또는 OrderStatus 문자열
    type?: string; // PaymentMethod 문자열
    search?: string; // 주문번호/주문명/유저정보 검색
};

const PAYMENT_STATUS_SET = new Set<string>(Object.values(PaymentStatus));
const ORDER_STATUS_SET = new Set<string>(Object.values(OrderStatus));
const PAYMENT_METHOD_SET = new Set<string>(Object.values(PaymentMethod));

function itemFinalPrice(item: { discountedPrice: number | null; originalPrice: number }): number {
    return item.discountedPrice ?? item.originalPrice;
}

export async function getLecturePaymentsByOrder(
    params: GetLecturePaymentsParams
): Promise<{ rows: LecturePaymentDetailRow[] }> {
    const { courseId, status, type, search } = params;

    const itemWhere: Prisma.OrderItemWhereInput = {
        productCategory: 'COURSE',
        OR: [{ courseId }, { productId: courseId }],
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

    // ✅ 전부 가져오기(페이징 제거)
    const payments = await cojoobooDb.payment.findMany({
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
                            productTitle: true,
                            originalPrice: true,
                            discountedPrice: true,
                        },
                        take: 1, // 해당 강의 아이템 1개면 충분
                    },
                },
            },
        },
    });

    const rows: LecturePaymentDetailRow[] = payments.map((p) => {
        const oi = p.order.orderItems[0];
        const title = oi?.productTitle ?? '(알 수 없음)';

        const buyerName = p.order.user?.username ?? null;

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

            courseId,
            courseTitle: title,

            itemPrice: oi ? itemFinalPrice(oi) : 0,

            paidAmount: p.amount,
            refundAmount: p.cancelAmount ?? 0,
            netAmount: p.amount - (p.cancelAmount ?? 0),
        };
    });

    return { rows };
}
