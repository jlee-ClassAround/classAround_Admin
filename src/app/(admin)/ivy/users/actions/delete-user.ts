'use server';

import { ivyDb } from '@/lib/ivyDb';
import { getIsAdmin } from '@/lib/is-admin';

export async function deleteUser(userId: string) {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) throw new Error('Unauthorized');

    await ivyDb.user.delete({
        where: { id: userId },
    });
}
