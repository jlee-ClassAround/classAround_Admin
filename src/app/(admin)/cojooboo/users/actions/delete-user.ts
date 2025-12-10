'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import { getIsAdmin } from '@/lib/is-admin';

export async function deleteUser(userId: string) {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) throw new Error('Unauthorized');

    await cojoobooDb.user.delete({
        where: { id: userId },
    });
}
