'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import { Prisma, ProductCategory, OrderStatus } from '@/generated/cojooboo';
import { DateRange } from 'react-day-picker';

export async function getPaymentStats({
    dateRange,
    status,
    type,
    courseId,
    search,
}: {
    dateRange?: DateRange;
    status?: string;
    type?: string; // 'COURSE' | 'EBOOK' | 'ALL'
    courseId?: string;
    search?: string;
} = {}) {
    try {
        // --------------------------------
        // 1️⃣ Order where 조건 구성
        // --------------------------------
        const orderWhere: Prisma.OrderWhereInput = {
            // 날짜 범위
            createdAt: dateRange?.from
                ? {
                      gte: dateRange.from,
                      lte: dateRange.to
                          ? new Date(dateRange.to.setHours(23, 59, 59, 999))
                          : undefined,
                  }
                : undefined,
        };

        // Order 상태 필터
        // status 파라미터가 있으면 해당 상태만 (PAID, PENDING 등)
        if (status && status !== 'ALL') {
            orderWhere.status = status as OrderStatus;
        }

        // 검색 조건 (사용자명, 이메일, 전화번호, 강의명)
        if (search) {
            orderWhere.OR = [
                {
                    user: {
                        OR: [
                            { username: { contains: search } },
                            { email: { contains: search } },
                            { phone: { contains: search } },
                        ],
                    },
                },
                {
                    orderItems: {
                        some: {
                            OR: [
                                { productTitle: { contains: search } },
                                { course: { title: { contains: search } } },
                            ],
                        },
                    },
                },
            ];
        }

        // 상품 타입 필터
        if (type && type !== 'ALL') {
            orderWhere.orderItems = {
                some: {
                    productCategory: type as ProductCategory,
                },
            };
        }

        // 특정 강의 필터
        if (courseId) {
            orderWhere.orderItems = {
                some: {
                    courseId: courseId,
                    productCategory: 'COURSE',
                },
            };
        }

        // --------------------------------
        // 2️⃣ Order 조회 (모든 관계 포함)
        // --------------------------------
        const orders = await cojoobooDb.order.findMany({
            where: orderWhere,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        phone: true,
                    },
                },
                orderItems: {
                    include: {
                        course: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                    },
                },
            },
        });

        // --------------------------------
        // 3️⃣ 통계 계산
        // --------------------------------
        let totalRevenue = 0;
        let totalOrders = 0;
        let courseRevenue = 0;
        let ebookRevenue = 0;
        let totalRefundAmount = 0;
        let couponUsageCount = 0;
        let totalDiscountAmount = 0;

        for (const order of orders) {
            // 주문 카운트
            totalOrders += 1;

            // --------------------------------
            // Order.status에 따른 금액 처리
            // --------------------------------
            if (order.status === 'PAID') {
                // 결제 완료: paidAmount 사용
                const paidAmount = order.paidAmount;

                // 총 매출 누적
                totalRevenue += paidAmount;

                // 전체 OrderItem 가격 합계 (비율 계산용)
                const totalItemPrice = order.orderItems.reduce((sum, item) => {
                    const itemPrice = item.discountedPrice ?? item.originalPrice;
                    return sum + itemPrice;
                }, 0);

                // 각 상품별로 매출 분배
                for (const item of order.orderItems) {
                    const itemPrice = item.discountedPrice ?? item.originalPrice;

                    // 이 상품이 전체에서 차지하는 비율
                    const itemRatio = totalItemPrice > 0 ? itemPrice / totalItemPrice : 0;

                    // 실제 결제금액을 비율대로 분배
                    const itemRevenue = Math.round(paidAmount * itemRatio);

                    // 카테고리별 매출 집계
                    if (item.productCategory === ProductCategory.COURSE) {
                        courseRevenue += itemRevenue;
                    } else if (item.productCategory === ProductCategory.EBOOK) {
                        ebookRevenue += itemRevenue;
                    }
                }
            } else if (order.status === 'PENDING' || order.status === 'CANCELED') {
                // 환불/취소: remainingAmount 사용
                const refundAmount = order.remainingAmount;

                // 환불액 누적
                totalRefundAmount += refundAmount;
            }

            // 쿠폰 사용 집계 (결제 완료 건만)
            if (order.status === 'PAID' && order.usedCoupon) {
                couponUsageCount += 1;

                // 쿠폰 할인액 = 원가 - 할인가
                const couponDiscount =
                    order.originalPrice - (order.discountedPrice ?? order.originalPrice);

                totalDiscountAmount += couponDiscount;
            }
        }

        // --------------------------------
        // 4️⃣ 결과 반환 (기존 구조 유지)
        // --------------------------------
        return {
            totalRevenue,
            totalOrders,
            courseRevenue,
            ebookRevenue,
            couponUsageCount,
            totalDiscountAmount,
            totalRefundAmount,
        };
    } catch (error) {
        console.error('[GET_PAYMENT_STATS_ERROR]', error);
        throw new Error('결제 통계를 불러오는데 실패했습니다.');
    }
}
