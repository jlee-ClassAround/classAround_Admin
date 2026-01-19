'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import { PaymentStatus, ProductCategory } from '@/generated/cojooboo';

export async function getCoursesWithCustomer(year?: number) {
    try {
        const startOfYear = year ? new Date(year, 0, 1) : undefined;
        const endOfYear = year ? new Date(year, 11, 31, 23, 59, 59, 999) : undefined;

        const allCourses = await cojoobooDb.course.findMany();

        const orders = await cojoobooDb.order.findMany({
            where: {
                orderItems: { some: { productCategory: 'COURSE' } },
            },
            include: {
                orderItems: true,
                payments: {
                    where: {
                        paymentStatus: {
                            in: [
                                PaymentStatus.DONE,
                                PaymentStatus.PARTIAL_CANCELED,
                                PaymentStatus.CANCELED,
                            ],
                        },
                    },
                },
            },
        });

        const revenueMap = new Map<string, number>();
        const refundMap = new Map<string, number>();

        orders.forEach((order) => {
            const paid = order.payments.reduce((acc, p) => acc + p.amount, 0);
            const refund = order.payments.reduce((acc, p) => acc + (p.cancelAmount ?? 0), 0);

            order.orderItems.forEach((item) => {
                if (item.courseId) {
                    revenueMap.set(item.courseId, (revenueMap.get(item.courseId) ?? 0) + paid);
                    refundMap.set(item.courseId, (refundMap.get(item.courseId) ?? 0) + refund);
                }
            });
        });

        const finalResult = allCourses
            .filter((course) => {
                const isParent = course.parentId === null;

                const isCorrectYear = year
                    ? course.createdAt >= startOfYear! && course.createdAt <= endOfYear!
                    : true;

                return isParent && isCorrectYear;
            })
            .map((parent) => {
                const children = allCourses.filter((c) => c.parentId === parent.id);

                let totalRevenue = revenueMap.get(parent.id) ?? 0;
                let totalRefund = refundMap.get(parent.id) ?? 0;

                children.forEach((child) => {
                    totalRevenue += revenueMap.get(child.id) ?? 0;
                    totalRefund += refundMap.get(child.id) ?? 0;
                });

                return {
                    ...parent,
                    totalRevenue,
                    totalRefund,
                    totalPrice: totalRevenue - totalRefund,
                };
            });

        return year
            ? finalResult.filter((r) => r.totalRevenue > 0 || r.totalRefund > 0)
            : finalResult;
    } catch (error) {
        console.error('[ERROR]', error);
        throw new Error('조회 실패');
    }
}
