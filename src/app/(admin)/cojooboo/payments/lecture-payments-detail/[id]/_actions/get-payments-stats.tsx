'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import { Prisma, OrderStatus, PaymentStatus, ProductCategory } from '@/generated/cojooboo';

/** ✅ 요청하신 통계 데이터 타입 */
export type LecturePaymentStats = {
    totalOrders: number;
    totalPaymentAmount: number;
    totalRefundAmount: number;
    finalPaymentAmount: number;
    couponUsageCount: number;
    totalDiscountAmount: number;
    refundStatsCount: number;
};

export async function getLecturePaymentStatsByOrder({
    courseId,
}: {
    courseId: string;
}): Promise<LecturePaymentStats> {
    // 1. 타겟 강의 ID 리스트 준비 (메인 + 하위 강의 포함)
    const childCourses = await cojoobooDb.course.findMany({
        where: { parentId: courseId },
        select: { id: true },
    });
    const targetCourseIds = [courseId, ...childCourses.map((c) => c.id)];
    const targetSet = new Set(targetCourseIds);

    // 2. 관련 주문을 '주문(Order)' 단위로 조회 (결제 중복 카운트 방지)
    // 💡 Payment 기준이 아닌 Order 기준으로 조회해야 43건이 아닌 40건으로 정렬됩니다.
    const orders = await cojoobooDb.order.findMany({
        where: {
            orderItems: {
                some: {
                    productCategory: ProductCategory.COURSE,
                    OR: [
                        { courseId: { in: targetCourseIds } },
                        { productId: { in: targetCourseIds } },
                    ],
                },
            },
            payments: {
                some: {
                    paymentStatus: {
                        in: [
                            PaymentStatus.DONE,
                            PaymentStatus.CANCELED,
                            PaymentStatus.PARTIAL_CANCELED,
                        ],
                    },
                },
            },
        },
        include: {
            orderItems: true,
            payments: true,
        },
    });

    let totalGrossRevenue = 0; // 🎯 엑셀 '전체합산' 목표: 292,024,539
    let totalRefundAmount = 0; // 🎯 엑셀 '환불금액합산' 목표: 79,734,539
    const refundedOrderNumbers = new Set<string>(); // 🎯 엑셀 '환불건수' 목표: 40

    for (const order of orders) {
        // A. 주문 내 모든 아이템 가격 총합 (비율 계산용 분모)
        const orderTotalItemPrice = order.orderItems.reduce(
            (sum, it) => sum + (it.discountedPrice ?? it.originalPrice ?? 0),
            0
        );

        // B. 주문 내 '타겟 강의'들의 가격 합계 (이 강의의 실제 매출액)
        const targetItemsPriceInOrder = order.orderItems
            .filter((it) => {
                const id = (it.courseId ?? it.productId) as string;
                return targetSet.has(id);
            })
            .reduce((sum, it) => sum + (it.discountedPrice ?? it.originalPrice ?? 0), 0);

        // ✅ [총매출 누적] 엑셀의 개별 행 가격을 더하는 것과 동일 (거품 제거)
        totalGrossRevenue += targetItemsPriceInOrder;

        // C. [환불액 및 환불건수 계산]
        if (orderTotalItemPrice > 0) {
            // 해당 주문의 전체 환불액 합산 (결제 기록이 여러 개일 경우 모두 합산)
            const orderTotalCancelAmount = order.payments.reduce(
                (sum, p) => sum + (p.cancelAmount ?? 0),
                0
            );

            if (orderTotalCancelAmount > 0) {
                // ✅ [환불액 누적] 타겟 강의 비율만큼 배분 후 반올림 (4원 오차 해결)
                const ratio = targetItemsPriceInOrder / orderTotalItemPrice;
                const allocatedRefund = Math.round(orderTotalCancelAmount * ratio);

                totalRefundAmount += allocatedRefund;

                // ✅ [환불건수 누적] 타겟 강의에 환불액이 배정된 경우만 카운트
                if (allocatedRefund > 0) {
                    refundedOrderNumbers.add(order.orderNumber || order.id);
                }
            }
        }
    }

    // 3. 쿠폰 할인 통계
    const couponOrders = orders.filter((o) => o.usedCoupon !== null);
    const totalDiscountAmount = couponOrders.reduce((sum, o) => {
        const uc = o.usedCoupon as any;
        const discount = uc?.couponAmount || uc?.discountAmount || uc?.amount || 0;
        return sum + discount;
    }, 0);

    return {
        totalOrders: orders.length, // 전체 고유 주문 수 (엑셀 행 수와 일치)
        totalPaymentAmount: totalGrossRevenue, // 총매출 (엑셀 SUM 합계와 일치)
        totalRefundAmount: totalRefundAmount, // 환불액 합계 (반올림 보정 완료)
        finalPaymentAmount: totalGrossRevenue - totalRefundAmount, // 순이익 (엑셀 순이익 합계와 일치)
        couponUsageCount: couponOrders.length,
        totalDiscountAmount,
        refundStatsCount: refundedOrderNumbers.size, // 고유 환불 주문 수 (40건)
    };
}
