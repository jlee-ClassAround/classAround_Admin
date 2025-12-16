'use server';

import { ivyDb } from '@/lib/ivyDb';

export async function getAllUsersWithoutPagination() {
    const users = await ivyDb.user.findMany({
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
