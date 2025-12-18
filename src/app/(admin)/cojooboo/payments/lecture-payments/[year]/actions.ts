'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';

type Money = number;

function sum(nums: Array<number | null | undefined>): number {
    return nums.reduce<number>((acc, n) => acc + (typeof n === 'number' ? n : 0), 0);
}

/**
 * 총액(total)을 items 비율로 분배 (반올림 오차는 마지막에 보정)
 */
function allocateByRatio<
    T extends { courseId: string | null; discountedPrice: number | null; originalPrice: number }
>(items: T[], total: Money): Map<string, Money> {
    const result = new Map<string, Money>();

    const valid = items.filter((i) => i.courseId);
    if (valid.length === 0) return result;

    const prices = valid.map((i) => (i.discountedPrice ?? i.originalPrice) || 0);
    const totalPrice = prices.reduce((a, b) => a + b, 0);

    if (totalPrice <= 0 || total === 0) {
        // 가격이 0이거나 total이 0이면 전부 0 처리
        for (const it of valid) result.set(it.courseId as string, 0);
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

    // courseId별로 누적(동일 courseId가 여러 item에 있을 수 있음)
    for (let i = 0; i < valid.length; i++) {
        const cid = valid[i].courseId as string;
        result.set(cid, (result.get(cid) ?? 0) + allocs[i]);
    }

    return result;
}

export async function getCoursesWithCustomer() {
    try {
        // 1) 모든 강의
        const courses = await cojoobooDb.course.findMany({
            orderBy: { createdAt: 'desc' },
        });

        const courseIds = courses.map((c) => c.id);

        // 2) 강의 주문 + 아이템 + 결제(환불 포함) 조회
        const orders = await cojoobooDb.order.findMany({
            where: {
                orderItems: {
                    some: {
                        courseId: { in: courseIds },
                        productCategory: 'COURSE',
                    },
                },
            },
            include: {
                orderItems: {
                    where: {
                        courseId: { in: courseIds },
                        productCategory: 'COURSE',
                    },
                    select: {
                        courseId: true,
                        originalPrice: true,
                        discountedPrice: true,
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

        // 3) courseId별 매출/환불 누적
        const revenueMap = new Map<string, Money>(); // 총 결제금액
        const refundMap = new Map<string, Money>(); // 총 환불금액

        // (선택) 결제금액 집계에 포함할 status만 골라서 쓰고 싶으면 여기서 필터링
        const paidStatusAllowList = new Set<string>([
            'PAID',
            'COMPLETED',
            'DONE',
            'CANCELED',
            'REFUNDED',
            'PARTIAL_REFUNDED',
        ]);

        for (const order of orders) {
            // ✅ 결제/환불은 Order.status가 아니라 Payment에서 가져오는 게 맞음
            const paidPayments = order.payments.filter((p) =>
                paidStatusAllowList.has(String(p.paymentStatus))
            );

            const orderPaid: Money = sum(paidPayments.map((p) => p.amount));
            const orderRefund: Money = sum(paidPayments.map((p) => p.cancelAmount));

            // 주문 단위로 강의들에 비율 배분
            const paidAlloc = allocateByRatio(order.orderItems, orderPaid);
            const refundAlloc = allocateByRatio(order.orderItems, orderRefund);

            for (const [courseId, amt] of paidAlloc.entries()) {
                revenueMap.set(courseId, (revenueMap.get(courseId) ?? 0) + amt);
            }
            for (const [courseId, amt] of refundAlloc.entries()) {
                refundMap.set(courseId, (refundMap.get(courseId) ?? 0) + amt);
            }
        }

        // 4) Course에 합치기
        const coursesWithRevenue = courses.map((course) => {
            const totalRevenue = revenueMap.get(course.id) ?? 0;
            const totalRefund = refundMap.get(course.id) ?? 0;

            return {
                ...course,
                totalRevenue, // 총 결제금액
                totalRefund, // 총 환불금액
                totalPrice: totalRevenue - totalRefund, // 순매출
            };
        });

        // 5) 메인 강의 + 옵션(variant) 통합
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
