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
        for (const it of items) result.set(it.key, 0);
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
            amount: Math.max(prev.amount ?? 0, r.amount ?? 0),
            cancelAmount: Math.max(prev.cancelAmount ?? 0, r.cancelAmount ?? 0),
            paymentStatus: prev.paymentStatus, // 단순화
        };
        byKey.set(k, merged);
    }
    return Array.from(byKey.values());
}

export async function getCoursesWithCustomer(year?: number) {
    try {
        const startDate = year ? new Date(year, 0, 1) : undefined;
        const endDate = year ? new Date(year, 11, 31, 23, 59, 59, 999) : undefined;

        // 1. 모든 강의 정보 가져오기 (parentId 포함)
        const allCourses = await ivyDb.course.findMany({
            orderBy: { createdAt: 'desc' },
        });

        const courseIds = allCourses.map((c) => c.id);
        const courseIdSet = new Set<string>(courseIds);

        // 2. 주문 데이터 조회
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
                orderItems: true,
                payments: {
                    where:
                        startDate && endDate
                            ? { createdAt: { gte: startDate, lte: endDate } }
                            : undefined,
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
                order.payments.filter((p) => paidStatuses.has(p.paymentStatus as PaymentStatus))
            );
            if (paidPayments.length === 0) continue;

            const orderPaid = sum(paidPayments.map((p) => p.amount));
            const orderRefund = sum(paidPayments.map((p) => p.cancelAmount));

            const allocItems = order.orderItems
                .map((it, idx) => {
                    const price = (it.discountedPrice ?? it.originalPrice) || 0;
                    if (it.productCategory === ProductCategory.COURSE) {
                        const cid = (it.courseId ?? it.productId) as string | null;
                        return cid ? { key: cid, price } : null;
                    }
                    return { key: `__EBOOK__:${it.productId ?? idx}`, price };
                })
                .filter((v): v is AllocItem => Boolean(v));

            const paidAlloc = allocateByRatio(allocItems, orderPaid);
            const refundAlloc = allocateByRatio(allocItems, orderRefund);

            for (const [k, amt] of paidAlloc.entries()) {
                if (courseIdSet.has(k)) revenueMap.set(k, (revenueMap.get(k) ?? 0) + amt);
            }
            for (const [k, amt] of refundAlloc.entries()) {
                if (courseIdSet.has(k)) refundMap.set(k, (refundMap.get(k) ?? 0) + amt);
            }
        }

        // 3. 강의 데이터 매출 결합
        const coursesWithRev = allCourses.map((c) => ({
            ...c,
            rev: revenueMap.get(c.id) ?? 0,
            ref: refundMap.get(c.id) ?? 0,
        }));

        // 4. ✅ [핵심 변경] parentId가 없는 것들만 메인으로 추출
        const mainCourses = coursesWithRev.filter((c) => c.parentId === null);

        // 5. 메인별로 자식(Variant) 매출 합산
        const finalResult = mainCourses.map((main) => {
            const children = coursesWithRev.filter((c) => c.parentId === main.id);

            const totalRevenue = main.rev + sum(children.map((c) => c.rev));
            const totalRefund = main.ref + sum(children.map((c) => c.ref));

            return {
                ...main,
                totalRevenue,
                totalRefund,
                totalPrice: totalRevenue - totalRefund,
            };
        });

        // 6. 연도 필터가 있으면 매출이 있는 것만, 없으면 전체 반환
        if (year) {
            return finalResult.filter((c) => c.totalRevenue > 0 || c.totalRefund > 0);
        }

        return finalResult;
    } catch (error) {
        console.error('[GET_COURSES_WITH_CUSTOMER_ERROR]', error);
        throw new Error('데이터를 불러오는데 실패했습니다.');
    }
}
