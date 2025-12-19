'use server';

import { ivyDb } from '@/lib/ivyDb';
import { PaymentStatus, ProductCategory } from '@/generated/ivy';

type Money = number;

function sum(nums: Array<number | null | undefined>): number {
    return nums.reduce<number>((acc, n) => acc + (typeof n === 'number' ? n : 0), 0);
}

type AllocItem = {
    key: string; // courseId 또는 기타 카테고리 키(분모 포함용)
    price: number; // discountedPrice ?? originalPrice
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

        const rank = (s: PaymentStatus): number => {
            if (s === PaymentStatus.CANCELED) return 3;
            if (s === PaymentStatus.PARTIAL_CANCELED) return 2;
            if (s === PaymentStatus.DONE) return 1;
            return 0;
        };

        const merged: PaymentRow = {
            ...prev,
            createdAt: prev.createdAt > r.createdAt ? prev.createdAt : r.createdAt,
            amount: Math.max(prev.amount ?? 0, r.amount ?? 0),
            cancelAmount: Math.max(prev.cancelAmount ?? 0, r.cancelAmount ?? 0),
            paymentStatus:
                rank(prev.paymentStatus) >= rank(r.paymentStatus)
                    ? prev.paymentStatus
                    : r.paymentStatus,
        };

        byKey.set(k, merged);
    }

    return Array.from(byKey.values());
}

export async function getCoursesWithCustomer() {
    try {
        // ✅ 매출/환불에 포함할 PaymentStatus (결제 이력 있는 주문만)
        const paidStatuses: PaymentStatus[] = [
            PaymentStatus.DONE,
            PaymentStatus.CANCELED,
            PaymentStatus.PARTIAL_CANCELED,
        ];

        // 1) 모든 강의 (타이틀 기반 main/variant 합치기 때문에 유지)
        const courses = await ivyDb.course.findMany({
            orderBy: { createdAt: 'desc' },
        });

        const courseIds: string[] = courses.map((c) => c.id);
        const courseIdSet = new Set<string>(courseIds);

        // 2) ✅ Payment 테이블 기준으로 "결제 이력 있는 주문"만 가져오기
        const orders = await ivyDb.order.findMany({
            where: {
                payments: {
                    some: {
                        paymentStatus: { in: paidStatuses },
                    },
                },
                orderItems: {
                    some: {
                        productCategory: 'COURSE',
                        OR: [{ courseId: { in: courseIds } }, { productId: { in: courseIds } }],
                    },
                },
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

        // 3) courseId별 매출/환불 누적 + ✅ "결제된 강의" Set
        const revenueMap = new Map<string, Money>();
        const refundMap = new Map<string, Money>();
        const paidCourseSet = new Set<string>(); // ✅ payment 기준으로 실제 결제 이력 있는 강의만

        for (const order of orders) {
            const paidPayments = dedupePayments(
                order.payments.filter((p) => paidStatuses.includes(p.paymentStatus))
            );

            // ✅ 결제 이력 있는 주문에 포함된 COURSE 아이템을 Set에 기록(금액 0이어도 포함)
            if (paidPayments.length > 0) {
                for (const it of order.orderItems) {
                    if (it.productCategory !== ProductCategory.COURSE) continue;
                    const cid = (it.courseId ?? it.productId) as string | null;
                    if (!cid) continue;
                    if (!courseIdSet.has(cid)) continue;
                    paidCourseSet.add(cid);
                }
            }

            const orderPaid: Money = sum(paidPayments.map((p) => p.amount));
            const orderRefund: Money = sum(paidPayments.map((p) => p.cancelAmount));

            // ✅ 주문 아이템 전체(강의+전자책)로 분모 구성
            const allocItems: AllocItem[] = order.orderItems
                .map((it, idx) => {
                    const price = (it.discountedPrice ?? it.originalPrice) || 0;

                    if (it.productCategory === ProductCategory.COURSE) {
                        const cid = (it.courseId ?? it.productId) as string | null;
                        if (!cid) return null;
                        return { key: cid, price };
                    }

                    const pid = it.productId ?? `__NO_PID__:${idx}`;
                    return { key: `__${String(it.productCategory)}__:${pid}`, price };
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

        // 4) Course에 합치기 + 결제여부 플래그
        const coursesWithRevenue = courses.map((course) => {
            const totalRevenue = revenueMap.get(course.id) ?? 0;
            const totalRefund = refundMap.get(course.id) ?? 0;

            return {
                ...course,
                totalRevenue,
                totalRefund,
                totalPrice: totalRevenue - totalRefund,
                hasPayment: paidCourseSet.has(course.id), // ✅ 핵심
            };
        });

        // 5) 메인 강의 + 옵션(variant) 통합
        const mainCourses = coursesWithRevenue.filter((course) =>
            course.title.trim().endsWith(']')
        );

        const merged = mainCourses.map((mainCourse) => {
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

            const hasPayment = mainCourse.hasPayment || variants.some((v) => v.hasPayment);

            return {
                ...mainCourse,
                totalRevenue,
                totalRefund,
                totalPrice: totalRevenue - totalRefund,
                hasPayment,
            };
        });

        // ✅ 6) Payment 기준으로 "결제된 강의 항목"만 반환
        return merged.filter((c) => c.hasPayment);
    } catch (error) {
        console.error('[GET_COURSES_WITH_CUSTOMER_ERROR]', error);
        throw new Error('강의별 매출을 불러오는데 실패했습니다.');
    }
}
