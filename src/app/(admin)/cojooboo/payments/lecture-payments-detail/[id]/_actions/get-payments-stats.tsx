'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import { Prisma, OrderStatus, PaymentStatus, ProductCategory } from '@/generated/cojooboo';

export type LecturePaymentStats = {
    totalOrders: number;
    totalPaymentAmount: number;
    totalRefundAmount: number;
    finalPaymentAmount: number;
    couponUsageCount: number;
    totalDiscountAmount: number;
    refundStatsCount: number;
};

type UsedCouponShape = {
    couponAmount?: number;
    amount?: number;
    discountAmount?: number;
};

type Money = number;

function safeNumber(v: unknown): number {
    const n: number = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : 0;
}

function itemFinalPrice(item: { discountedPrice: number | null; originalPrice: number }): number {
    return item.discountedPrice ?? item.originalPrice;
}

function allocateByRatio<T extends { key: string; price: number }>(
    items: T[],
    total: Money
): Map<string, Money> {
    const result: Map<string, Money> = new Map();
    if (items.length === 0) return result;

    const prices: number[] = items.map((i) => i.price || 0);
    const totalPrice: number = prices.reduce((a, b) => a + b, 0);

    if (totalPrice <= 0 || total === 0) {
        for (const it of items) result.set(it.key, 0);
        return result;
    }

    const allocs: number[] = prices.map((p) => Math.floor((total * p) / totalPrice));
    const used: number = allocs.reduce((a, b) => a + b, 0);
    let remain: number = total - used;

    let idx: number = 0;
    while (remain > 0) {
        allocs[idx] += 1;
        remain -= 1;
        idx = (idx + 1) % allocs.length;
    }

    for (let i = 0; i < items.length; i++) {
        const k: string = items[i].key;
        result.set(k, (result.get(k) ?? 0) + allocs[i]);
    }

    return result;
}

/**
 * ✅ 일부 시스템에서는 "취소/부분취소" 시 amount가 '남은금액(=0)'으로 업데이트되기도 함.
 * 그 경우 총매출(원 결제금액)을 복원하기 위해,
 * cancelAmount가 있고 amount < cancelAmount 이면 gross = amount + cancelAmount 로 계산.
 */
function resolveGrossPaidAmount(params: {
    amount: number;
    cancelAmount: number | null;
    status: PaymentStatus;
}): number {
    const amount: number = params.amount ?? 0;
    const cancel: number = params.cancelAmount ?? 0;

    if (cancel <= 0) return amount;

    if (
        params.status === PaymentStatus.CANCELED ||
        params.status === PaymentStatus.PARTIAL_CANCELED
    ) {
        // ✅ amount가 '환불 후 잔액'으로 들어온 경우만 복원
        if (amount < cancel) return amount + cancel;
    }

    return amount;
}

export async function getLecturePaymentStatsByOrder({
    courseId,
}: {
    courseId: string;
}): Promise<LecturePaymentStats> {
    const childCourses: Array<{ id: string }> = await cojoobooDb.course.findMany({
        where: { parentId: courseId },
        select: { id: true },
    });

    const targetCourseIds: string[] = [courseId, ...childCourses.map((c) => c.id)];

    const whereOrderCourse: Prisma.OrderWhereInput = {
        orderItems: {
            some: {
                productCategory: ProductCategory.COURSE, // ✅ enum으로 통일
                OR: [{ courseId: { in: targetCourseIds } }, { productId: { in: targetCourseIds } }],
            },
        },
    };

    const totalOrders: number = await cojoobooDb.order.count({ where: whereOrderCourse });

    const payments = await cojoobooDb.payment.findMany({
        where: {
            order: whereOrderCourse,
            paymentStatus: {
                in: [PaymentStatus.DONE, PaymentStatus.CANCELED, PaymentStatus.PARTIAL_CANCELED],
            },
        },
        select: {
            amount: true,
            cancelAmount: true,
            paymentStatus: true,
            order: {
                select: {
                    orderItems: {
                        where: { productCategory: ProductCategory.COURSE }, // ✅ enum으로 통일
                        select: {
                            courseId: true,
                            productId: true,
                            originalPrice: true,
                            discountedPrice: true,
                        },
                    },
                },
            },
        },
    });

    let allocatedPaidSum: Money = 0; // ✅ 총매출(결제된 금액)
    let allocatedRefundSum: Money = 0; // ✅ 환불 합계

    for (const p of payments) {
        const items = p.order.orderItems
            .map((it) => {
                const resolvedCourseId: string | null = (it.courseId ?? it.productId) as
                    | string
                    | null;
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

        // ✅ 핵심: 총매출(원 결제금액) 복원
        const grossPaid: number = resolveGrossPaidAmount({
            amount: p.amount,
            cancelAmount: p.cancelAmount,
            status: p.paymentStatus,
        });

        const paidAlloc = allocateByRatio(items, grossPaid);
        const refundAlloc = allocateByRatio(items, p.cancelAmount ?? 0);

        for (const cid of targetCourseIds) {
            allocatedPaidSum += paidAlloc.get(cid) ?? 0;
            allocatedRefundSum += refundAlloc.get(cid) ?? 0;
        }
    }

    const netAmount: Money = allocatedPaidSum - allocatedRefundSum;

    const refundStatsCount: number = await cojoobooDb.order.count({
        where: {
            ...whereOrderCourse,
            status: { in: [OrderStatus.REFUNDED, OrderStatus.PARTIAL_REFUNDED] },
        },
    });

    const couponOrders = await cojoobooDb.order.findMany({
        where: { ...whereOrderCourse, usedCoupon: { not: Prisma.AnyNull } },
        select: { usedCoupon: true },
    });

    const couponUsageCount: number = couponOrders.length;

    const totalDiscountAmount: Money = couponOrders.reduce((sum: number, o) => {
        const uc: UsedCouponShape | null = o.usedCoupon as unknown as UsedCouponShape | null;
        if (!uc) return sum;

        const couponAmount: number =
            safeNumber(uc.couponAmount) || safeNumber(uc.discountAmount) || safeNumber(uc.amount);

        return sum + couponAmount;
    }, 0);

    return {
        totalOrders,
        totalPaymentAmount: allocatedPaidSum, // ✅ 총매출은 gross
        totalRefundAmount: allocatedRefundSum,
        finalPaymentAmount: netAmount,
        couponUsageCount,
        totalDiscountAmount,
        refundStatsCount,
    };
}
