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
    status?: string;
    type?: string;
    search?: string;
};

const PAYMENT_STATUS_SET: ReadonlySet<string> = new Set<string>(Object.values(PaymentStatus));
const ORDER_STATUS_SET: ReadonlySet<string> = new Set<string>(Object.values(OrderStatus));
const PAYMENT_METHOD_SET: ReadonlySet<string> = new Set<string>(Object.values(PaymentMethod));

type Money = number;

function itemFinalPrice(item: { discountedPrice: number | null; originalPrice: number }): number {
    return item.discountedPrice ?? item.originalPrice;
}

function sum(nums: Array<number | null | undefined>): number {
    return nums.reduce<number>((acc, n) => acc + (typeof n === 'number' ? n : 0), 0);
}

/**
 * 총액(total)을 items 비율로 분배 (반올림 오차는 마지막에 보정)
 */
function allocateByRatio<T extends { key: string; price: number }>(
    items: T[],
    total: Money
): Map<string, Money> {
    const result = new Map<string, Money>();
    if (items.length === 0) return result;

    const prices = items.map((i) => i.price || 0);
    const totalPrice = prices.reduce((a, b) => a + b, 0);

    if (totalPrice <= 0 || total === 0) {
        for (const it of items) result.set(it.key, 0);
        return result;
    }

    const allocs: number[] = prices.map((p) => Math.floor((total * p) / totalPrice));
    const used = allocs.reduce((a, b) => a + b, 0);
    let remain = total - used;

    let idx = 0;
    while (remain > 0) {
        allocs[idx] += 1;
        remain -= 1;
        idx = (idx + 1) % allocs.length;
    }

    for (let i = 0; i < items.length; i++) {
        const k = items[i].key;
        result.set(k, (result.get(k) ?? 0) + allocs[i]);
    }

    return result;
}

export async function getLecturePaymentsByOrder(
    params: GetLecturePaymentsParams
): Promise<{ rows: LecturePaymentDetailRow[] }> {
    const { courseId, status, type, search } = params;

    // ✅ parentId 자식 강의 자동 포함
    const childCourses = await cojoobooDb.course.findMany({
        where: { parentId: courseId },
        select: { id: true },
    });
    const targetCourseIds: string[] = [courseId, ...childCourses.map((c) => c.id)];

    const itemWhereForOrder: Prisma.OrderItemWhereInput = {
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
            orderItems: { some: itemWhereForOrder },
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
                    // ✅ 배분하려면 orderItems를 "전부" 가져와야 함(최소한 COURSE 전체)
                    orderItems: {
                        where: { productCategory: 'COURSE' },
                        select: {
                            courseId: true,
                            productId: true,
                            productTitle: true,
                            originalPrice: true,
                            discountedPrice: true,
                            productCategory: true,
                        },
                    },
                },
            },
        },
    });

    const rows: LecturePaymentDetailRow[] = [];

    for (const p of payments) {
        const orderItems = p.order.orderItems;

        // ✅ 이 주문의 COURSE 아이템들 가격 기준으로 결제/환불 배분
        const allocBase = orderItems
            .map((it) => {
                const resolvedCourseId = (it.courseId ?? it.productId) as string | null;
                if (!resolvedCourseId) return null;
                return {
                    key: resolvedCourseId,
                    price: itemFinalPrice({
                        originalPrice: it.originalPrice,
                        discountedPrice: it.discountedPrice,
                    }),
                };
            })
            .filter((v): v is { key: string; price: number } => Boolean(v?.key));

        const paidAlloc = allocateByRatio(allocBase, p.amount);
        const refundAlloc = allocateByRatio(allocBase, p.cancelAmount ?? 0);

        for (const it of orderItems) {
            const resolvedCourseId = (it.courseId ?? it.productId) as string | null;
            if (!resolvedCourseId) continue;
            if (!targetCourseIds.includes(resolvedCourseId)) continue;

            const paidAmount = paidAlloc.get(resolvedCourseId) ?? 0;
            const refundAmount = refundAlloc.get(resolvedCourseId) ?? 0;

            rows.push({
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
                buyerName: p.order.user?.username ?? null,
                buyerEmail: p.order.user?.email ?? null,
                buyerPhone: p.order.user?.phone ?? null,

                courseId: resolvedCourseId,
                courseTitle: it.productTitle ?? '(알 수 없음)',

                itemPrice: itemFinalPrice({
                    originalPrice: it.originalPrice,
                    discountedPrice: it.discountedPrice,
                }),

                paidAmount,
                refundAmount,
                netAmount: paidAmount - refundAmount,
            });
        }
    }

    return { rows };
}
