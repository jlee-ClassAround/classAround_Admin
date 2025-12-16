'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import { Prisma, ProductCategory, PaymentStatus } from '@/generated/cojooboo';
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
    type?: string; // COURSE | EBOOK | ALL
    courseId?: string;
    search?: string;
} = {}) {
    try {
        // --------------------------------
        // 1️⃣ Payment where (결제 기준)
        // --------------------------------
        const paymentWhere: Prisma.PaymentWhereInput = {
            paymentStatus: status && status !== 'ALL' ? (status as PaymentStatus) : undefined,
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
        // 2️⃣ OrderItem where (상품 기준)
        // --------------------------------
        const orderItemWhere: Prisma.OrderItemWhereInput = {
            productCategory: type && type !== 'ALL' ? (type as ProductCategory) : undefined,
            courseId: courseId || undefined,
        };

        // 검색 (유저 / 상품명)
        if (search) {
            orderItemWhere.OR = [
                { productTitle: { contains: search } },
                {
                    order: {
                        user: {
                            OR: [
                                { username: { contains: search } },
                                { email: { contains: search } },
                                { phone: { contains: search } },
                            ],
                        },
                    },
                },
            ];
        }

        // --------------------------------
        // 3️⃣ 결제 데이터 조회
        // --------------------------------
        const payments = await cojoobooDb.payment.findMany({
            where: paymentWhere,
            include: {
                order: {
                    include: {
                        orderItems: {
                            where: orderItemWhere,
                        },
                    },
                },
            },
        });

        // --------------------------------
        // 4️⃣ 통계 계산
        // --------------------------------
        let totalRevenue = 0;
        let totalOrders = 0;

        let courseRevenue = 0;
        let ebookRevenue = 0;

        let totalRefundAmount = 0;
        let couponUsageCount = 0;
        let totalDiscountAmount = 0;

        for (const payment of payments) {
            const isRefunded = payment.paymentStatus === 'CANCELED';

            const paidAmount = isRefunded ? 0 : payment.amount - (payment.cancelAmount ?? 0);

            totalRevenue += paidAmount;
            totalOrders += 1;
            totalRefundAmount += payment.cancelAmount ?? 0;

            for (const item of payment.order.orderItems) {
                if (item.productCategory === 'COURSE') {
                    courseRevenue += paidAmount;
                }
                if (item.productCategory === 'EBOOK') {
                    ebookRevenue += paidAmount;
                }

                if (payment.order.usedCoupon) {
                    couponUsageCount += 1;
                    totalDiscountAmount +=
                        item.originalPrice - (item.discountedPrice ?? item.originalPrice);
                }
            }
        }

        // --------------------------------
        // 5️⃣ 현금결제 (추후 추가 예정)
        // --------------------------------
        /*
    const cashPayments = await cojoobooDb.payment.findMany({
      where: {
        paymentMethod: 'CASH',
        ...
      },
    });
    */

        // --------------------------------
        // 6️⃣ 결과 반환 (기존 구조 유지)
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
