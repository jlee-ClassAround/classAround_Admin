'use server';

import { ivyDb } from '@/lib/ivyDb';
import { Prisma } from '@/generated/ivy';
import { SortingState } from '@tanstack/react-table';

interface GetAllUsersParams {
    currentPage?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
}

export async function getAllUsers({
    currentPage = 1,
    pageSize = 50,
    search = '',
    sort = 'createdAt',
    order = 'desc',
}: GetAllUsersParams) {
    const filters: Prisma.UserWhereInput[] = [
        {
            OR: [
                { roleId: null },
                {
                    roleId: {
                        notIn: ['admin', 'superadmin'],
                    },
                },
            ],
        },
    ];

    if (search) {
        filters.push({
            OR: [
                { username: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ],
        });
    }

    const whereClause = filters.length > 1 ? { AND: filters } : filters.at(0) ?? {};

    // 정렬 조건
    const orderBy: Prisma.UserOrderByWithRelationInput = {
        [sort]: order,
    };

    // 데이터 조회
    const [users, totalCount] = await Promise.all([
        ivyDb.user.findMany({
            where: whereClause,
            orderBy,
            skip: (currentPage - 1) * pageSize,
            take: pageSize,
        }),
        ivyDb.user.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    // 서버사이드 정렬 상태 생성
    const serverSorting: SortingState = [{ id: sort, desc: order === 'desc' }];

    return {
        users,
        totalCount,
        totalPages,
        serverSorting,
    };
}
