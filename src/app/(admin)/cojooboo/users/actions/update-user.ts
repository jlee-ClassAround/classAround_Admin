'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import { getIsAdmin } from '@/lib/is-admin';
import { UserDataSchema } from '@/lib/cojooboo/schemas';

export async function updateUser(userId: string, values: UserDataSchema) {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) throw new Error('Unauthorized');

    await cojoobooDb.user.update({
        where: { id: userId },
        data: values,
    });

    return true;
}
