'use server';

import { Prisma } from '@/generated/classaround';
import { caDb } from '@/lib/caDb';
import { getIsAdmin } from '@/lib/is-admin';
import { SortingState } from '@tanstack/react-table';

interface GetAdminUsersParams {
    currentPage?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
}

const ADMIN_ROLE_IDS = ['admin', 'superadmin'];

export async function getAdminUsers({
    currentPage = 1,
    pageSize = 50,
    search = '',
    sort = 'createdAt',
    order = 'desc',
}: GetAdminUsersParams) {
    const filters: Prisma.UserWhereInput[] = [
        {
            roleId: {
                in: ADMIN_ROLE_IDS,
            },
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

    const orderBy: Prisma.UserOrderByWithRelationInput = {
        [sort]: order,
    };

    const [users, totalCount] = await Promise.all([
        caDb.user.findMany({
            where: whereClause,
            orderBy,
            skip: (currentPage - 1) * pageSize,
            take: pageSize,
        }),
        caDb.user.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);
    const serverSorting: SortingState = [{ id: sort, desc: order === 'desc' }];

    return {
        users,
        totalCount,
        totalPages,
        serverSorting,
    };
}

export async function deleteUser(userId: string) {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) throw new Error('Unauthorized');

    const targetUser = await caDb.user.findUnique({
        where: { id: userId },
        select: { id: true, roleId: true },
    });

    if (!targetUser) {
        throw new Error('User not found');
    }

    if (targetUser.roleId === 'superadmin') {
        throw new Error('슈퍼 관리자 계정은 삭제할 수 없습니다.');
    }

    await caDb.user.delete({
        where: { id: userId },
    });
}

export async function deleteUsers(userIds: string[]) {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) throw new Error('Unauthorized');

    const targetUsers = await caDb.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, roleId: true },
    });

    if (!targetUsers.length) {
        throw new Error('삭제할 사용자를 찾을 수 없습니다.');
    }

    const hasSuperAdmin = targetUsers.some((user) => user.roleId === 'superadmin');

    if (hasSuperAdmin) {
        throw new Error('슈퍼 관리자 계정은 삭제할 수 없습니다.');
    }

    await caDb.user.deleteMany({
        where: { id: { in: userIds } },
    });
}
