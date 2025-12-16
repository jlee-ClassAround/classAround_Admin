'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';

export async function getAllUsersWithoutPagination() {
    const users = await cojoobooDb.user.findMany({
        where: {
            OR: [
                { roleId: null },
                {
                    roleId: {
                        notIn: ['admin', 'superadmin'],
                    },
                },
            ],
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return users;
}
