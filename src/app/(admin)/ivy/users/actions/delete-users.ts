'use server';

import { ivyDb } from '@/lib/ivyDb';
import { getIsAdmin } from '@/lib/is-admin';

export async function deleteUsers(userIds: string[]) {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) throw new Error('Unauthorized');

    await ivyDb.user.deleteMany({
        where: { id: { in: userIds } },
    });
}
