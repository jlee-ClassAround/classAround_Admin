'use server';

import { ivyDb } from '@/lib/ivyDb';
import { getIsAdmin } from '@/lib/is-admin';
import { UserDataSchema } from '@/lib/ivy/schemas';

export async function updateUser(userId: string, values: UserDataSchema) {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) throw new Error('Unauthorized');

    await ivyDb.user.update({
        where: { id: userId },
        data: values,
    });

    return true;
}
