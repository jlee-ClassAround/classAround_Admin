'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import { getIsAdmin } from '@/lib/is-admin';

export async function deleteUsers(userIds: string[]) {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) throw new Error('Unauthorized');

    await cojoobooDb.user.deleteMany({
        where: { id: { in: userIds } },
    });
}
