'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import { PaymentStatus, ProductCategory } from '@/generated/cojooboo';

type Money = number;

function sum(nums: Array<number | null | undefined>): number {
    return nums.reduce<number>((acc, n) => acc + (typeof n === 'number' ? n : 0), 0);
}

type AllocItem = {
    key: string; // courseId 또는 기타 카테고리 키(분모 포함용)
    price: number; // discountedPrice ?? originalPrice
};

/**
 * 총액(total)을 items 가격 비율로 분배 (반올림 오차는 마지막에 보정)
 * - key로 묶어서 Map으로 반환
 */
function allocateByRatio(items: AllocItem[], total: Money): Map<string, Money> {
    const result = new Map<string, Money>();
    if (items.length === 0) return result;

    const prices = items.map((i) => i.price || 0);
    const totalPrice = prices.reduce((a, b) => a + b, 0);

    if (totalPrice <= 0 || total === 0) {
        for (const it of items) result.set(it.key, (result.get(it.key) ?? 0) + 0);
        return result;
    }

    // 1차 배분(내림)
    const allocs: number[] = prices.map((p) => Math.floor((total * p) / totalPrice));
    let used = allocs.reduce((a, b) => a + b, 0);
    let remain = total - used;

    // 남은 금액을 앞에서부터 1원씩 분배(합 정확히 맞추기)
    let idx = 0;
    while (remain > 0) {
        allocs[idx] += 1;
        remain -= 1;
        idx = (idx + 1) % allocs.length;
    }

    // key별 누적
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

/**
 * 같은 tossPaymentKey가 여러 row로 중복 저장된 경우(싱크/상태변경 누적) 대비:
 * - tossPaymentKey가 있으면 그 키 기준으로 묶어서
 *   amount/cancelAmount는 최대값을 사용(중복 합산 방지)
 * - tossPaymentKey가 없으면 id 기준(그대로)
 */
function dedupePayments(rows: PaymentRow[]): PaymentRow[] {
    const byKey = new Map<string, PaymentRow>();

    for (const r of rows) {
        const k = r.tossPaymentKey ?? `__NO_KEY__:${r.id}`;

        const prev = byKey.get(k);
        if (!prev) {
            byKey.set(k, r);
            continue;
        }

        // 같은 결제키 중복일 때: 더 “큰” 값(최신/정합)을 취함
        const merged: PaymentRow = {
            ...prev,
            // createdAt은 최신값 유지(참고용)
            createdAt: prev.createdAt > r.createdAt ? prev.createdAt : r.createdAt,
            amount: Math.max(prev.amount ?? 0, r.amount ?? 0),
            cancelAmount: Math.max(prev.cancelAmount ?? 0, r.cancelAmount ?? 0),
            // 상태는 보수적으로 "더 강한 상태"를 선택
            // (PARTIAL_CANCELED / CANCELED 가 DONE 보다 우선)
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

export async function getCoursesWithCustomer() {
    try {
        // 1) 모든 강의
        const courses = await cojoobooDb.course.findMany({
            orderBy: { createdAt: 'desc' },
        });

        const courseIds: string[] = courses.map((c) => c.id);
        const courseIdSet = new Set<string>(courseIds);

        // 2) "해당 강의가 포함된 주문"만 가져오되,
        //    분배 분모 정확도를 위해 주문의 (COURSE/EBOOK) 아이템을 같이 가져옴
        const orders = await cojoobooDb.order.findMany({
            where: {
                orderItems: {
                    some: {
                        productCategory: 'COURSE',
                        OR: [{ courseId: { in: courseIds } }, { productId: { in: courseIds } }],
                    },
                },
            },
            include: {
                // ✅ 분모를 위해 강의/전자책 아이템 포함(필요하면 다른 카테고리도 추가 가능)
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

        // 3) courseId별 매출/환불 누적
        const revenueMap = new Map<string, Money>();
        const refundMap = new Map<string, Money>();

        // ✅ 매출/환불에 포함할 PaymentStatus (승인된 결제들)
        const paidStatuses: Set<PaymentStatus> = new Set<PaymentStatus>([
            PaymentStatus.DONE,
            PaymentStatus.CANCELED,
            PaymentStatus.PARTIAL_CANCELED,
        ]);

        for (const order of orders) {
            // ✅ Payment 기준으로 집계 + 중복 결제키 제거
            const paidPayments = dedupePayments(
                order.payments.filter((p) => paidStatuses.has(p.paymentStatus))
            );

            const orderPaid: Money = sum(paidPayments.map((p) => p.amount));
            const orderRefund: Money = sum(paidPayments.map((p) => p.cancelAmount));

            // ✅ 주문의 아이템 전체(강의+전자책)로 분모 구성
            //    - 강의는 key=courseId(또는 productId fallback)
            //    - 전자책은 key=EBOOK:<productId> 로 분모에만 포함(강의 매출엔 미반영)
            const allocItems: AllocItem[] = order.orderItems
                .map((it, idx) => {
                    const price = (it.discountedPrice ?? it.originalPrice) || 0;

                    if (it.productCategory === ProductCategory.COURSE) {
                        const cid = (it.courseId ?? it.productId) as string | null;
                        if (!cid) return null;
                        return { key: cid, price };
                    }

                    // EBOOK 등은 분모 포함용(키는 유니크하게)
                    const pid = it.productId ?? `__NO_PID__:${idx}`;
                    return { key: `__${String(it.productCategory)}__:${pid}`, price };
                })
                .filter((v): v is AllocItem => Boolean(v));

            const paidAlloc = allocateByRatio(allocItems, orderPaid);
            const refundAlloc = allocateByRatio(allocItems, orderRefund);

            // ✅ 강의(courseIds)에 해당하는 키만 누적
            for (const [k, amt] of paidAlloc.entries()) {
                if (!courseIdSet.has(k)) continue;
                revenueMap.set(k, (revenueMap.get(k) ?? 0) + amt);
            }
            for (const [k, amt] of refundAlloc.entries()) {
                if (!courseIdSet.has(k)) continue;
                refundMap.set(k, (refundMap.get(k) ?? 0) + amt);
            }
        }

        // 4) Course에 합치기 (output 형태 유지)
        const coursesWithRevenue = courses.map((course) => {
            const totalRevenue = revenueMap.get(course.id) ?? 0;
            const totalRefund = refundMap.get(course.id) ?? 0;

            return {
                ...course,
                totalRevenue, // 총 결제금액(강의에 할당된)
                totalRefund, // 총 환불금액(강의에 할당된)
                totalPrice: totalRevenue - totalRefund, // 순매출
            };
        });

        // 5) 메인 강의 + 옵션(variant) 통합 (기존 로직 유지)
        const mainCourses = coursesWithRevenue.filter((course) =>
            course.title.trim().endsWith(']')
        );

        const result = mainCourses.map((mainCourse) => {
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

        return result;
    } catch (error) {
        console.error('[GET_COURSES_WITH_CUSTOMER_ERROR]', error);
        throw new Error('강의별 매출을 불러오는데 실패했습니다.');
    }
}
