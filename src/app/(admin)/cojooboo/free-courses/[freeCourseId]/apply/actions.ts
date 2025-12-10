'use server';

import { getIsAdmin } from '@/lib/is-admin';
import { cojoobooDb } from '@/lib/cojoobooDb';

export async function deleteApply(applyId: string) {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) throw new Error('Unauthorized');

    await cojoobooDb.applyCourse.delete({
        where: {
            id: applyId,
        },
    });

    return {
        success: true,
    };
}
