'use server';

import { ivyDb } from '@/lib/ivyDb';
import { PaymentStatus, ProductCategory } from '@/generated/ivy';

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
    const used = allocs.reduce((a, b) => a + b, 0);
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

    const rank = (s: PaymentStatus): number => {
        if (s === PaymentStatus.CANCELED) return 3;
        if (s === PaymentStatus.PARTIAL_CANCELED) return 2;
        if (s === PaymentStatus.DONE) return 1;
        return 0;
    };

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
            paymentStatus:
                rank(prev.paymentStatus) >= rank(r.paymentStatus)
                    ? prev.paymentStatus
                    : r.paymentStatus,
        };

        byKey.set(k, merged);
    }

    return Array.from(byKey.values());
}

type CourseEntity = Awaited<ReturnType<typeof ivyDb.course.findMany>>[number];

type CourseWithRevenue = CourseEntity & {
    totalRevenue: Money;
    totalRefund: Money;
    totalPrice: Money;
    hasPayment: boolean;
};

export async function getCoursesWithCustomer(): Promise<CourseWithRevenue[]> {
    try {
        const paidStatuses: PaymentStatus[] = [
            PaymentStatus.DONE,
            PaymentStatus.CANCELED,
            PaymentStatus.PARTIAL_CANCELED,
        ];

        const courses: CourseEntity[] = await ivyDb.course.findMany({
            orderBy: { createdAt: 'desc' },
        });

        const courseIds: string[] = courses.map((c) => c.id);
        const courseIdSet = new Set<string>(courseIds);

        // ✅ 여기서 'COURSE' 문자열 -> ProductCategory.COURSE 로 수정
        const orders = await ivyDb.order.findMany({
            where: {
                payments: {
                    some: {
                        paymentStatus: { in: paidStatuses },
                    },
                },
                orderItems: {
                    some: {
                        productCategory: ProductCategory.COURSE,
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

        const revenueMap = new Map<string, Money>();
        const refundMap = new Map<string, Money>();
        const paidCourseSet = new Set<string>();

        for (const order of orders) {
            const paidPayments = dedupePayments(
                order.payments.filter((p) => paidStatuses.includes(p.paymentStatus))
            );

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

        const coursesWithRevenue: CourseWithRevenue[] = courses.map((course) => {
            const totalRevenue = revenueMap.get(course.id) ?? 0;
            const totalRefund = refundMap.get(course.id) ?? 0;

            return {
                ...course,
                totalRevenue,
                totalRefund,
                totalPrice: totalRevenue - totalRefund,
                hasPayment: paidCourseSet.has(course.id),
            };
        });

        // parentId 인덱스
        const childrenByParent = new Map<string, CourseWithRevenue[]>();
        for (const c of coursesWithRevenue) {
            const parentId = (c as { parentId?: string | null }).parentId ?? null;
            if (!parentId) continue;
            if (!childrenByParent.has(parentId)) childrenByParent.set(parentId, []);
            childrenByParent.get(parentId)!.push(c);
        }

        const collectDescendants = (parentId: string): CourseWithRevenue[] => {
            const out: CourseWithRevenue[] = [];
            const visited = new Set<string>();
            const queue: string[] = [parentId];

            while (queue.length > 0) {
                const pid = queue.shift() as string;
                const children = childrenByParent.get(pid) ?? [];
                for (const child of children) {
                    if (visited.has(child.id)) continue;
                    visited.add(child.id);
                    out.push(child);
                    queue.push(child.id);
                }
            }
            return out;
        };

        // ✅ 메인 = parentId 없는 부모 강의 전체 (타이틀 규칙 제거)
        const mainCourses: CourseWithRevenue[] = coursesWithRevenue.filter((c) => {
            const parentId = (c as { parentId?: string | null }).parentId ?? null;
            return !parentId;
        });

        const merged: CourseWithRevenue[] = mainCourses.map((mainCourse) => {
            const variants = collectDescendants(mainCourse.id);

            const totalRevenue =
                mainCourse.totalRevenue +
                variants.reduce<Money>((acc, v) => acc + v.totalRevenue, 0);
            const totalRefund =
                mainCourse.totalRefund + variants.reduce<Money>((acc, v) => acc + v.totalRefund, 0);
            const hasPayment = mainCourse.hasPayment || variants.some((v) => v.hasPayment);

            return {
                ...mainCourse,
                totalRevenue,
                totalRefund,
                totalPrice: totalRevenue - totalRefund,
                hasPayment,
            };
        });

        return merged.filter((c) => c.hasPayment);
    } catch (error) {
        console.error('[GET_COURSES_WITH_CUSTOMER_ERROR]', error);
        throw new Error('강의별 매출을 불러오는데 실패했습니다.');
    }
}
