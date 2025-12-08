// actions/dashboard/get-stats.ts
'use server';

import { DashboardRepository } from '@/repositories/dashboard-repository';
import { type BrandType } from '@/types/common';

export async function getDashboardStats(brand: BrandType) {
    try {
        const repo = new DashboardRepository(brand);
        const stats = await repo.getStats();
        return { success: true, data: stats };
    } catch (error) {
        console.error('[GET_DASHBOARD_STATS_ERROR]', error);
        return { success: false, error: '통계 조회에 실패했습니다.' };
    }
}

export async function getLatestOrders(brand: BrandType, limit: number = 5) {
    try {
        const repo = new DashboardRepository(brand);
        const orders = await repo.getLatestOrders(limit);
        return { success: true, data: orders };
    } catch (error) {
        console.error('[GET_LATEST_ORDERS_ERROR]', error);
        return { success: false, error: '주문 조회에 실패했습니다.' };
    }
}
