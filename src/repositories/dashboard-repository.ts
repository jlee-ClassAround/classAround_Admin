// lib/repositories/dashboard-repository.ts
import { type BrandType, type DashboardStats } from '@/types/common';
import { UserRepository } from './user-repository';
import { OrderRepository } from './order-repository';

export class DashboardRepository {
    private userRepo: UserRepository;
    private orderRepo: OrderRepository;

    constructor(brand: BrandType) {
        this.userRepo = new UserRepository(brand);
        this.orderRepo = new OrderRepository(brand);
    }

    async getStats(): Promise<DashboardStats> {
        const [totalUsers, todayUsers, totalRevenue, orders] = await Promise.all([
            this.userRepo.count({ excludeAdmin: true }),
            this.userRepo.getTodayCount(),
            this.orderRepo.getTotalRevenue(),
            this.orderRepo.findMany(),
        ]);

        return {
            totalUsers,
            todayUsers,
            totalRevenue,
            totalOrders: orders.length,
        };
    }

    async getLatestOrders(limit: number = 5) {
        return this.orderRepo.findMany({ take: limit, orderBy: 'desc' });
    }
}
