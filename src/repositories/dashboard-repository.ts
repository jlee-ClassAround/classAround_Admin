import { DashboardStats } from '@/types/dashboard';
import { OrderRepository } from './order-repository';
import { UserRepository } from './user-repository';

export class DashboardRepository {
    private userRepo: UserRepository;
    private orderRepo: OrderRepository;

    constructor() {
        this.userRepo = new UserRepository('ivy');
        this.orderRepo = new OrderRepository('ivy');
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
