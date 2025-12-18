'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import { Prisma, OrderStatus, PaymentStatus } from '@/generated/cojooboo';

export type LecturePaymentStats = {
    totalOrders: number; // 전체 주문 수
    totalPaymentAmount: number; // 총 결제 금액(환불 포함: DONE/CANCELED/PARTIAL_CANCELED 결제금액 합)
    totalRefundAmount: number; // 총 환불 금액(Payment.cancelAmount 합)
    finalPaymentAmount: number; // 최종 매출 = 결제 - 환불
    couponUsageCount: number; // 쿠폰 사용 주문 수(usedCoupon 존재)
    totalDiscountAmount: number; // 쿠폰 할인 합(usedCoupon.couponAmount 합)
    refundStatsCount: number; // 환불(부분환불 포함) 주문 수
};

type UsedCouponShape = {
    couponAmount?: number;
    amount?: number;
    discountAmount?: number;
};

function safeNumber(v: unknown): number {
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : 0;
}

export async function getLecturePaymentStatsByOrder({
    courseId,
}: {
    courseId: string;
}): Promise<LecturePaymentStats> {
    try {
        // ✅ "이 강의를 포함한 주문" 필터
        const whereOrderCourse: Prisma.OrderWhereInput = {
            orderItems: {
                some: {
                    productCategory: 'COURSE',
                    OR: [{ courseId }, { productId: courseId }],
                },
            },
        };

        /** ------------------------------------------------------------------
         * 1) 주문 수
         * ------------------------------------------------------------------ */
        const totalOrders = await cojoobooDb.order.count({
            where: whereOrderCourse,
        });

        /** ------------------------------------------------------------------
         * 2) 결제/환불 금액 (Payment 기준)
         * - 결제금액: DONE / CANCELED / PARTIAL_CANCELED (실제로 승인된 결제들)
         * - 환불금액: cancelAmount 합
         * ------------------------------------------------------------------ */
        const paymentAgg = await cojoobooDb.payment.aggregate({
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
            _sum: {
                amount: true,
                cancelAmount: true,
            },
        });

        const totalPaymentAmount = paymentAgg._sum.amount ?? 0;
        const totalRefundAmount = paymentAgg._sum.cancelAmount ?? 0;
        const finalPaymentAmount = totalPaymentAmount - totalRefundAmount;

        /** ------------------------------------------------------------------
         * 3) 환불 건수 (Order 기준: 주문 상태로 카운트)
         * ------------------------------------------------------------------ */
        const refundStatsCount = await cojoobooDb.order.count({
            where: {
                ...whereOrderCourse,
                status: {
                    in: [OrderStatus.REFUNDED, OrderStatus.PARTIAL_REFUNDED],
                },
            },
        });

        /** ------------------------------------------------------------------
         * 4) 쿠폰 사용/할인 (Order.usedCoupon 기준)
         * ------------------------------------------------------------------ */
        const couponOrders = await cojoobooDb.order.findMany({
            where: {
                ...whereOrderCourse,
                // ✅ Json? 필드는 null 비교 대신 JsonNullableFilter를 사용해야 함
                // - AnyNull: DbNull(SQL NULL) + JsonNull(JSON null) 모두 포함
                usedCoupon: { not: Prisma.AnyNull },
            },
            select: {
                usedCoupon: true,
            },
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
            totalPaymentAmount,
            totalRefundAmount,
            finalPaymentAmount,
            couponUsageCount,
            totalDiscountAmount,
            refundStatsCount,
        };
    } catch (error) {
        console.error('[GET_PAYMENT_STATS_BY_ORDER_ERROR]', error);
        throw new Error('결제 통계를 불러오는데 실패했습니다.');
    }
}
