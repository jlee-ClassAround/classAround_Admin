'use server';

import { ivyDb } from '@/lib/ivyDb';
import { PaymentStatus, ProductCategory, Prisma } from '@/generated/ivy';

type Money = number;

function sum(nums: Array<number | null | undefined>): number {
    return nums.reduce<number>((acc, n) => acc + (typeof n === 'number' ? n : 0), 0);
}

type AllocItem = {
    key: string;
    price: number;
};

function allocateByRatio(items: AllocItem[], total: Money): Map<string, Money> {
    const result = new Map<string, Money>();
    if (items.length === 0) return result;

    const prices = items.map((i) => i.price || 0);
    const totalPrice = prices.reduce((a, b) => a + b, 0);

    if (totalPrice <= 0 || total === 0) {
        for (const it of items) result.set(it.key, (result.get(it.key) ?? 0) + 0);
        return result;
    }

    const allocs: number[] = prices.map((p) => Math.floor((total * p) / totalPrice));
    let used = allocs.reduce((a, b) => a + b, 0);
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

type PaymentRow = {
    id: string;
    tossPaymentKey: string | null;
    amount: number;
    cancelAmount: number | null;
    paymentStatus: PaymentStatus;
    createdAt: Date;
};

function dedupePayments(rows: PaymentRow[]): PaymentRow[] {
    const byKey = new Map<string, PaymentRow>();

    for (const r of rows) {
        const k = r.tossPaymentKey ?? `__NO_KEY__:${r.id}`;

        const prev = byKey.get(k);
        if (!prev) {
            byKey.set(k, r);
            continue;
        }

        const merged: PaymentRow = {
            ...prev,
            createdAt: prev.createdAt > r.createdAt ? prev.createdAt : r.createdAt,
            amount: Math.max(prev.amount ?? 0, r.amount ?? 0),
            cancelAmount: Math.max(prev.cancelAmount ?? 0, r.cancelAmount ?? 0),
            paymentStatus: (() => {
                const rank = (s: PaymentStatus): number => {
                    if (s === PaymentStatus.CANCELED) return 3;
                    if (s === PaymentStatus.PARTIAL_CANCELED) return 2;
                    if (s === PaymentStatus.DONE) return 1;
                    return 0;
                };
                return rank(prev.paymentStatus) >= rank(r.paymentStatus)
                    ? prev.paymentStatus
                    : r.paymentStatus;
            })(),
        };

        byKey.set(k, merged);
    }

    return Array.from(byKey.values());
}

export async function getCoursesWithCustomer(year?: number) {
    try {
        const startDate = year ? new Date(year, 0, 1) : undefined;
        const endDate = year ? new Date(year, 11, 31, 23, 59, 59, 999) : undefined;

        // 1. 모든 강의 기초 정보
        const courses = await ivyDb.course.findMany({
            orderBy: { createdAt: 'desc' },
        });

        const courseIds = courses.map((c) => c.id);
        const courseIdSet = new Set<string>(courseIds);

        const orders = await ivyDb.order.findMany({
            where: {
                orderItems: {
                    some: {
                        productCategory: 'COURSE',
                        OR: [{ courseId: { in: courseIds } }, { productId: { in: courseIds } }],
                    },
                },
                ...(startDate && endDate
                    ? {
                          payments: {
                              some: {
                                  createdAt: { gte: startDate, lte: endDate },
                                  paymentStatus: {
                                      in: [
                                          PaymentStatus.DONE,
                                          PaymentStatus.CANCELED,
                                          PaymentStatus.PARTIAL_CANCELED,
                                      ],
                                  },
                              },
                          },
                      }
                    : {}),
            },
            include: {
                orderItems: {
                    where: {
                        productCategory: { in: [ProductCategory.COURSE, ProductCategory.EBOOK] },
                    },
                    select: {
                        productCategory: true,
                        courseId: true,
                        productId: true,
                        originalPrice: true,
                        discountedPrice: true,
                    },
                },
                payments: {
                    where:
                        startDate && endDate
                            ? { createdAt: { gte: startDate, lte: endDate } }
                            : undefined,
                    select: {
                        id: true,
                        tossPaymentKey: true,
                        amount: true,
                        cancelAmount: true,
                        paymentStatus: true,
                        createdAt: true,
                    },
                },
            },
        });

        const revenueMap = new Map<string, Money>();
        const refundMap = new Map<string, Money>();

        const paidStatuses: Set<PaymentStatus> = new Set([
            PaymentStatus.DONE,
            PaymentStatus.CANCELED,
            PaymentStatus.PARTIAL_CANCELED,
        ]);

        for (const order of orders) {
            const paidPayments = dedupePayments(
                order.payments.filter((p) => paidStatuses.has(p.paymentStatus))
            );
            if (paidPayments.length === 0) continue;

            const orderPaid = sum(paidPayments.map((p) => p.amount));
            const orderRefund = sum(paidPayments.map((p) => p.cancelAmount));

            const allocItems = order.orderItems
                .map((it, idx) => {
                    const price = (it.discountedPrice ?? it.originalPrice) || 0;
                    if (it.productCategory === ProductCategory.COURSE) {
                        const cid = (it.courseId ?? it.productId) as string | null;
                        if (!cid) return null;
                        return { key: cid, price };
                    }
                    return { key: `__EBOOK__:${it.productId ?? idx}`, price };
                })
                .filter((v): v is AllocItem => Boolean(v));

            const paidAlloc = allocateByRatio(allocItems, orderPaid);
            const refundAlloc = allocateByRatio(allocItems, orderRefund);

            for (const [k, amt] of paidAlloc.entries()) {
                if (!courseIdSet.has(k)) continue;
                revenueMap.set(k, (revenueMap.get(k) ?? 0) + amt);
            }
            for (const [k, amt] of refundAlloc.entries()) {
                if (!courseIdSet.has(k)) continue;
                refundMap.set(k, (refundMap.get(k) ?? 0) + amt);
            }
        }

        const coursesWithRevenue = courses.map((course) => {
            const totalRevenue = revenueMap.get(course.id) ?? 0;
            const totalRefund = refundMap.get(course.id) ?? 0;
            return {
                ...course,
                totalRevenue,
                totalRefund,
                totalPrice: totalRevenue - totalRefund,
            };
        });

        const mainCourses = coursesWithRevenue.filter((course) =>
            course.title.trim().endsWith(']')
        );

        const finalResult = mainCourses.map((mainCourse) => {
            const variants = coursesWithRevenue.filter(
                (c) =>
                    c.id !== mainCourse.id &&
                    (c.title.startsWith(mainCourse.title + '-') ||
                        c.title.startsWith(mainCourse.title + '_'))
            );

            const totalRevenue =
                mainCourse.totalRevenue + variants.reduce((acc, v) => acc + v.totalRevenue, 0);
            const totalRefund =
                mainCourse.totalRefund + variants.reduce((acc, v) => acc + v.totalRefund, 0);

            return {
                ...mainCourse,
                totalRevenue,
                totalRefund,
                totalPrice: totalRevenue - totalRefund,
            };
        });

        // ✅ [필터링 강화] 연도가 지정된 경우 매출이나 환불 내역이 존재하는 강의만 반환합니다.
        if (year) {
            return finalResult.filter((item) => item.totalRevenue > 0 || item.totalRefund > 0);
        }

        return finalResult;
    } catch (error) {
        console.error('[GET_COURSES_WITH_CUSTOMER_ERROR]', error);
        throw new Error('데이터를 불러오는데 실패했습니다.');
    }
}
