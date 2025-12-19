'use server';

import { ivyDb } from '@/lib/ivyDb';
import { Prisma, ProductCategory, PaymentStatus, OrderStatus } from '@/generated/ivy';
import type { DateRange } from 'react-day-picker';

type UsedCouponShape = {
    couponAmount?: number;
    amount?: number;
    discountAmount?: number;
};

function safeNumber(v: unknown): number {
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : 0;
}

function sum(nums: Array<number | null | undefined>): number {
    return nums.reduce<number>((acc, n) => acc + (typeof n === 'number' ? n : 0), 0);
}

/**
 * 총액(total)을 items 비율로 분배 (반올림 오차는 마지막에 보정)
 */
function allocateByRatio<T extends { key: string; price: number }>(
    items: T[],
    total: number
): Map<string, number> {
    const result = new Map<string, number>();
    if (items.length === 0) return result;

    const totalPrice = items.reduce((acc, it) => acc + (it.price || 0), 0);
    if (totalPrice <= 0 || total === 0) {
        for (const it of items) result.set(it.key, 0);
        return result;
    }

    const allocs = items.map((it) => Math.floor((total * it.price) / totalPrice));
    let used = allocs.reduce((a, b) => a + b, 0);
    let remain = total - used;

    let idx = 0;
    while (remain > 0) {
        allocs[idx] += 1;
        remain -= 1;
        idx = (idx + 1) % allocs.length;
    }

    for (let i = 0; i < items.length; i++) {
        result.set(items[i].key, (result.get(items[i].key) ?? 0) + allocs[i]);
    }

    return result;
}

export type PaymentStatsResult = {
    totalRevenue: number; // 총 결제 금액(환불 포함)
    totalOrders: number; // 주문 수
    courseRevenue: number; // 강의 결제금액(배분)
    ebookRevenue: number; // 전자책 결제금액(배분)
    couponUsageCount: number; // 쿠폰 사용 주문 수
    totalDiscountAmount: number; // 쿠폰 할인 합
    totalRefundAmount: number; // 환불 금액 합(cancelAmount)
    finalRevenue: number; // 순이익 = totalRevenue - totalRefundAmount
};

export async function getPaymentStats({
    dateRange,
    status,
    type,
    courseId,
    search,
}: {
    dateRange?: DateRange;
    status?: string; // OrderStatus or PaymentStatus
    type?: string; // 'COURSE' | 'EBOOK' | 'ALL'
    courseId?: string;
    search?: string;
} = {}): Promise<PaymentStatsResult> {
    try {
        // --------------------------------
        // 1) Order where 조건 구성
        // --------------------------------
        const orderWhere: Prisma.OrderWhereInput = {
            createdAt: dateRange?.from
                ? {
                      gte: dateRange.from,
                      lte: dateRange.to
                          ? new Date(dateRange.to.setHours(23, 59, 59, 999))
                          : undefined,
                  }
                : undefined,
        };

        const statusUpper = (status ?? '').toUpperCase();
        const orderStatusSet = new Set<string>(Object.values(OrderStatus));
        const paymentStatusSet = new Set<string>(Object.values(PaymentStatus));

        // ✅ OrderStatus면 order.status 필터
        if (statusUpper && statusUpper !== 'ALL' && orderStatusSet.has(statusUpper)) {
            orderWhere.status = statusUpper as OrderStatus;
        }

        // 검색 조건
        const q = (search ?? '').trim();
        if (q) {
            orderWhere.OR = [
                {
                    user: {
                        OR: [
                            { username: { contains: q, mode: 'insensitive' } },
                            { email: { contains: q, mode: 'insensitive' } },
                            { phone: { contains: q, mode: 'insensitive' } },
                        ],
                    },
                },
                {
                    orderItems: {
                        some: {
                            OR: [
                                { productTitle: { contains: q, mode: 'insensitive' } },
                                { course: { title: { contains: q, mode: 'insensitive' } } },
                            ],
                        },
                    },
                },
            ];
        }

        // 상품 타입 / 특정 강의 필터
        const itemSome: Prisma.OrderItemWhereInput = {};

        if (type && type !== 'ALL') {
            itemSome.productCategory = type as ProductCategory;
        }

        if (courseId) {
            // 강의 상세는 무조건 COURSE로
            itemSome.productCategory = ProductCategory.COURSE;
            itemSome.OR = [{ courseId }, { productId: courseId }];
        }

        if (Object.keys(itemSome).length > 0) {
            orderWhere.orderItems = { some: itemSome };
        }

        // --------------------------------
        // 2) Order 조회 (✅ payments/orderItems 포함되도록 select로 강제)
        // --------------------------------
        const orders = await ivyDb.order.findMany({
            where: orderWhere,
            select: {
                id: true,
                status: true,
                createdAt: true,
                originalPrice: true,
                discountedPrice: true,
                usedCoupon: true,

                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        phone: true,
                    },
                },

                orderItems: {
                    select: {
                        productCategory: true,
                        originalPrice: true,
                        discountedPrice: true,
                        courseId: true,
                        productId: true,
                        productTitle: true,
                    },
                },

                payments: {
                    select: {
                        amount: true,
                        cancelAmount: true,
                        paymentStatus: true,
                    },
                },
            },
        });

        // --------------------------------
        // 3) 통계 계산 (Payment 기준 + 배분)
        // --------------------------------
        let totalRevenue = 0;
        let totalRefundAmount = 0;
        let totalOrders = 0;

        let courseRevenue = 0;
        let ebookRevenue = 0;

        let couponUsageCount = 0;
        let totalDiscountAmount = 0;

        const paidStatuses: Set<PaymentStatus> = new Set<PaymentStatus>([
            PaymentStatus.DONE,
            PaymentStatus.CANCELED,
            PaymentStatus.PARTIAL_CANCELED,
        ]);

        // ✅ status가 PaymentStatus면 루프에서 필터 적용
        const paymentStatusFilter: PaymentStatus | undefined =
            statusUpper && statusUpper !== 'ALL' && paymentStatusSet.has(statusUpper)
                ? (statusUpper as PaymentStatus)
                : undefined;

        for (const order of orders) {
            const paidPayments = order.payments
                .filter((p) => paidStatuses.has(p.paymentStatus))
                .filter((p) =>
                    paymentStatusFilter ? p.paymentStatus === paymentStatusFilter : true
                );

            const orderPaidAmount = sum(paidPayments.map((p) => p.amount));
            const orderRefundAmount = sum(paidPayments.map((p) => p.cancelAmount));

            totalOrders += 1;
            totalRevenue += orderPaidAmount;
            totalRefundAmount += orderRefundAmount;

            // 카테고리별 매출 배분(총 결제금액을 COURSE/EBOOK으로 나눠 담기)
            const coursePrice = order.orderItems
                .filter((it) => it.productCategory === ProductCategory.COURSE)
                .reduce((acc, it) => acc + ((it.discountedPrice ?? it.originalPrice) || 0), 0);

            const ebookPrice = order.orderItems
                .filter((it) => it.productCategory === ProductCategory.EBOOK)
                .reduce((acc, it) => acc + ((it.discountedPrice ?? it.originalPrice) || 0), 0);

            const allocBase: Array<{ key: string; price: number }> = [];
            if (coursePrice > 0) allocBase.push({ key: 'COURSE', price: coursePrice });
            if (ebookPrice > 0) allocBase.push({ key: 'EBOOK', price: ebookPrice });

            const alloc = allocateByRatio(allocBase, orderPaidAmount);
            courseRevenue += alloc.get('COURSE') ?? 0;
            ebookRevenue += alloc.get('EBOOK') ?? 0;

            // 쿠폰(결제 있는 주문만)
            if (orderPaidAmount > 0 && order.usedCoupon !== null) {
                couponUsageCount += 1;

                const uc = order.usedCoupon as unknown as UsedCouponShape | null;

                const jsonDiscount =
                    (uc
                        ? safeNumber(uc.couponAmount) ||
                          safeNumber(uc.discountAmount) ||
                          safeNumber(uc.amount)
                        : 0) || 0;

                const fallbackDiscount =
                    (order.originalPrice ?? 0) -
                    (order.discountedPrice ?? order.originalPrice ?? 0);

                totalDiscountAmount +=
                    jsonDiscount > 0 ? jsonDiscount : Math.max(0, fallbackDiscount);
            }
        }

        const finalRevenue = totalRevenue - totalRefundAmount;

        return {
            totalRevenue,
            totalOrders,
            courseRevenue,
            ebookRevenue,
            couponUsageCount,
            totalDiscountAmount,
            totalRefundAmount,
            finalRevenue,
        };
    } catch (error) {
        console.error('[GET_PAYMENT_STATS_ERROR]', error);
        throw new Error('결제 통계를 불러오는데 실패했습니다.');
    }
}
