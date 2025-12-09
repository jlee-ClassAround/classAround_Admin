// lib/repositories/order-repository.ts
import { ivyDb } from '@/lib/ivyDb';
import { cojoobooDb } from '@/lib/cojoobooDb';
import { type BrandType, type CommonOrder } from '@/types/common';

export class OrderRepository {
    private db;

    constructor(brand: BrandType) {
        this.db = brand === 'ivy' ? ivyDb : cojoobooDb;
    }

    async findMany(options?: { take?: number; orderBy?: 'asc' | 'desc' }): Promise<CommonOrder[]> {
        const orders = await this.db.tossCustomer.findMany({
            include: {
                user: {
                    select: {
                        username: true,
                    },
                },
            },
            orderBy: {
                createdAt: options?.orderBy ?? 'desc',
            },
            take: options?.take,
        });

        return orders.map(this.toCommonOrder);
    }

    async getTotalRevenue(): Promise<number> {
        const result = await this.db.tossCustomer.aggregate({
            _sum: {
                finalPrice: true,
            },
            where: {
                paymentStatus: 'COMPLETED',
            },
        });

        return result._sum.finalPrice ?? 0;
    }

    // Adapter: DB 모델 → 공통 타입 변환
    private toCommonOrder(order: any): CommonOrder {
        return {
            id: order.id,
            orderName: order.orderName,
            finalPrice: order.finalPrice,
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt,
            user: order.user
                ? {
                      username: order.user.username ?? null,
                  }
                : null,
        };
    }
}
