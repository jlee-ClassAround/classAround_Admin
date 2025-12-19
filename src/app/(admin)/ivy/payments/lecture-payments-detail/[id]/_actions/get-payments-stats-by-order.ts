'use server';

import { ivyDb } from '@/lib/ivyDb';
import { Prisma, OrderStatus, PaymentStatus } from '@/generated/ivy';

export type LecturePaymentStats = {
    totalOrders: number;
    totalPaymentAmount: number; // ✅ "순매출(환불 반영)"으로 쓰려면 net을 넣음
    totalRefundAmount: number;
    finalPaymentAmount: number; // net 동일 유지(기존 화면 호환)
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
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : 0;
}

function itemFinalPrice(item: { discountedPrice: number | null; originalPrice: number }): number {
    return item.discountedPrice ?? item.originalPrice;
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

export async function getLecturePaymentStatsByOrder({
    courseId,
}: {
    courseId: string;
}): Promise<LecturePaymentStats> {
    try {
        // ✅ parentId 자식 자동 포함
        const childCourses = await ivyDb.course.findMany({
            where: { parentId: courseId },
            select: { id: true },
        });
        const targetCourseIds: string[] = [courseId, ...childCourses.map((c) => c.id)];

        const whereOrderCourse: Prisma.OrderWhereInput = {
            orderItems: {
                some: {
                    productCategory: 'COURSE',
                    OR: [
                        { courseId: { in: targetCourseIds } },
                        { productId: { in: targetCourseIds } },
                    ],
                },
            },
        };

        const totalOrders = await ivyDb.order.count({
            where: whereOrderCourse,
        });

        // ✅ 여기서 aggregate(sum) 쓰지 말고, 결제 레코드를 가져와 배분 합산
        const payments = await ivyDb.payment.findMany({
            where: {
                order: whereOrderCourse,
                paymentStatus: {
                    in: [
                        PaymentStatus.DONE,
                        PaymentStatus.CANCELED,
                        PaymentStatus.PARTIAL_CANCELED,
                    ],
                },
            },
            select: {
                amount: true,
                cancelAmount: true,
                order: {
                    select: {
                        orderItems: {
                            where: { productCategory: 'COURSE' },
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

        let allocatedPaidSum = 0;
        let allocatedRefundSum = 0;

        for (const p of payments) {
            const items = p.order.orderItems
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

            const paidAlloc = allocateByRatio(items, p.amount);
            const refundAlloc = allocateByRatio(items, p.cancelAmount ?? 0);

            // ✅ 우리(부모+자식) targetCourseIds에 해당하는 몫만 합산
            for (const cid of targetCourseIds) {
                allocatedPaidSum += paidAlloc.get(cid) ?? 0;
                allocatedRefundSum += refundAlloc.get(cid) ?? 0;
            }
        }

        const netAmount = allocatedPaidSum - allocatedRefundSum;

        const refundStatsCount = await ivyDb.order.count({
            where: {
                ...whereOrderCourse,
                status: {
                    in: [OrderStatus.REFUNDED, OrderStatus.PARTIAL_REFUNDED],
                },
            },
        });

        const couponOrders = await ivyDb.order.findMany({
            where: {
                ...whereOrderCourse,
                usedCoupon: { not: Prisma.AnyNull },
            },
            select: { usedCoupon: true },
        });

        const couponUsageCount = couponOrders.length;

        const totalDiscountAmount = couponOrders.reduce((sum: number, o) => {
            const uc = o.usedCoupon as unknown as UsedCouponShape | null;
            if (!uc) return sum;

            const couponAmount =
                safeNumber(uc.couponAmount) ||
                safeNumber(uc.discountAmount) ||
                safeNumber(uc.amount);

            return sum + couponAmount;
        }, 0);

        return {
            totalOrders,
            totalPaymentAmount: netAmount,

            totalRefundAmount: allocatedRefundSum,
            finalPaymentAmount: netAmount,

            couponUsageCount,
            totalDiscountAmount,
            refundStatsCount,
        };
    } catch (error) {
        console.error('[GET_PAYMENT_STATS_BY_ORDER_ERROR]', error);
        throw new Error('결제 통계를 불러오는데 실패했습니다.');
    }
}
