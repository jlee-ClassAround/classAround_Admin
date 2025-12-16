'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import { Prisma, PaymentStatus, ProductCategory } from '@/generated/cojooboo';
import { DateRange } from 'react-day-picker';

interface CourseRevenueStats {
    courseId: string;
    courseTitle: string;
    totalRevenue: number;
    orderCount: number;
    userCount: number;
}

export async function getCourseRevenueStats({
    dateRange,
    status,
}: {
    dateRange?: DateRange;
    status?: string;
} = {}): Promise<CourseRevenueStats[]> {
    try {
        // --------------------------------
        // 1️⃣ Payment where 조건
        // --------------------------------
        const paymentWhere: Prisma.PaymentWhereInput = {
            paymentStatus:
                status && status !== 'ALL' ? (status as PaymentStatus) : PaymentStatus.DONE,
            createdAt: dateRange?.from
                ? {
                      gte: dateRange.from,
                      lt: dateRange.to
                          ? new Date(new Date(dateRange.to).setDate(dateRange.to.getDate() + 1))
                          : undefined,
                  }
                : undefined,
        };

        // --------------------------------
        // 2️⃣ 결제 데이터 조회 (강의만)
        // --------------------------------
        const payments = await cojoobooDb.payment.findMany({
            where: paymentWhere,
            include: {
                order: {
                    include: {
                        orderItems: {
                            where: {
                                productCategory: ProductCategory.COURSE,
                                courseId: { not: null }, // courseId가 있는 것만
                            },
                            include: {
                                course: {
                                    select: {
                                        id: true,
                                        title: true,
                                    },
                                },
                            },
                        },
                        user: {
                            select: {
                                id: true,
                            },
                        },
                    },
                },
            },
        });

        // --------------------------------
        // 3️⃣ 강의별 데이터 집계
        // --------------------------------
        const courseMap = new Map<
            string,
            {
                courseId: string;
                courseTitle: string;
                totalRevenue: number;
                orderCount: number;
                userIds: Set<string>;
            }
        >();

        for (const payment of payments) {
            // 결제 완료된 금액 (환불액 제외)
            const paidAmount = payment.amount - (payment.cancelAmount ?? 0);

            const orderItems = payment.order.orderItems;
            if (orderItems.length === 0) continue;

            // 전체 상품 가격 합계
            const totalItemPrice = orderItems.reduce((sum, item) => {
                const itemPrice = item.discountedPrice ?? item.originalPrice;
                return sum + itemPrice;
            }, 0);

            // 각 강의별로 매출 분배
            for (const item of orderItems) {
                if (!item.courseId || !item.course) continue;

                const itemPrice = item.discountedPrice ?? item.originalPrice;
                const itemRatio = totalItemPrice > 0 ? itemPrice / totalItemPrice : 0;
                const itemRevenue = Math.round(paidAmount * itemRatio);

                // 강의 데이터 집계
                const existing = courseMap.get(item.courseId);

                if (existing) {
                    existing.totalRevenue += itemRevenue;
                    existing.orderCount += 1;
                    if (payment.order.userId) {
                        existing.userIds.add(payment.order.userId);
                    }
                } else {
                    courseMap.set(item.courseId, {
                        courseId: item.courseId,
                        courseTitle: item.course.title,
                        totalRevenue: itemRevenue,
                        orderCount: 1,
                        userIds: new Set(payment.order.userId ? [payment.order.userId] : []),
                    });
                }
            }
        }

        // --------------------------------
        // 4️⃣ 결과 변환 (매출 높은 순으로 정렬)
        // --------------------------------
        const result: CourseRevenueStats[] = Array.from(courseMap.values())
            .map((data) => ({
                courseId: data.courseId,
                courseTitle: data.courseTitle,
                totalRevenue: data.totalRevenue,
                orderCount: data.orderCount,
                userCount: data.userIds.size,
            }))
            .sort((a, b) => b.totalRevenue - a.totalRevenue);

        return result;
    } catch (error) {
        console.error('[GET_COURSE_REVENUE_STATS_ERROR]', error);
        throw new Error('강의별 매출 통계를 불러오는데 실패했습니다.');
    }
}
