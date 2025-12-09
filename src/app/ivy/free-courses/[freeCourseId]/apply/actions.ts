'use server';

import { getIsAdmin } from '@/lib/is-admin';
import { ivyDb } from '@/lib/ivyDb';

export async function deleteApply(applyId: string) {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) throw new Error('Unauthorized');

    await ivyDb.applyCourse.delete({
        where: {
            id: applyId,
        },
    });

    return {
        success: true,
    };
}
