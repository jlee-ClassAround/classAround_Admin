// lib/repositories/user-repository.ts
import { ivyDb } from '@/lib/ivyDb';
import { cojoobooDb } from '@/lib/cojoobooDb';
import { type BrandType, type CommonUser } from '@/types/common';

export class UserRepository {
    private db;

    constructor(brand: BrandType) {
        this.db = brand === 'ivy' ? ivyDb : cojoobooDb;
    }

    async findMany(): Promise<CommonUser[]> {
        const users = await this.db.user.findMany();
        return users.map(this.toCommonUser);
    }

    async count(filters?: { excludeAdmin?: boolean }): Promise<number> {
        const where = filters?.excludeAdmin
            ? {
                  OR: [{ roleId: null }, { NOT: { roleId: 'admin' } }],
              }
            : undefined;

        return await this.db.user.count({ where });
    }

    async findById(id: string): Promise<CommonUser | null> {
        const user = await this.db.user.findUnique({
            where: { id },
        });

        return user ? this.toCommonUser(user) : null;
    }

    async getTodayCount(): Promise<number> {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        return await this.db.user.count({
            where: {
                createdAt: {
                    gte: todayStart,
                    lte: todayEnd,
                },
            },
        });
    }

    // Adapter: DB 모델 → 공통 타입 변환
    private toCommonUser(user: any): CommonUser {
        return {
            id: user.id,
            username: user.username ?? user.nickname ?? null,
            email: user.email ?? null,
            phone: user.phone ?? null,
            createdAt: user.createdAt,
        };
    }
}
