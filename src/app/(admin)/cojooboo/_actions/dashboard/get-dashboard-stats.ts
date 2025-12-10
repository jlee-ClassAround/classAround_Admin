'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import { getPaymentStats } from '../payments/get-payment-stats';

export default async function getDashboardStats() {
    const totalUsers = await cojoobooDb.user.count({
        where: {
            OR: [
                { roleId: null },
                {
                    NOT: {
                        roleId: 'admin',
                    },
                },
            ],
        },
    });
    const todayUsers = await getUserCountSignedToday();

    const orders = await cojoobooDb.tossCustomer.findMany({
        include: {
            user: {
                select: {
                    username: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    const latestOrders = orders.slice(0, 5);

    // 총 매출액 계산
    const { totalRevenue } = await getPaymentStats();

    return {
        orders,
        totalUsers,
        todayUsers,
        totalRevenue,
        latestOrders,
    };
}
async function getUserCountSignedToday() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0); // 오늘 00:00:00

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999); // 오늘 23:59:59
    console.log(`todayStart : ${todayStart}`);
    console.log(`todayEnd : ${todayEnd}`);
    const todayUsers = await cojoobooDb.user.count({
        where: {
            createdAt: {
                gte: todayStart,
                lte: todayEnd,
            },
        },
    });

    return todayUsers;
}
