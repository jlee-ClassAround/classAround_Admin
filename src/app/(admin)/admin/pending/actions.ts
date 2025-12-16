'use server';

import { caDb } from '@/lib/caDb';
import { revalidatePath } from 'next/cache';

export async function approveAdminAction(formData: FormData) {
    const userId = formData.get('userId')?.toString();

    await caDb.user.update({
        where: { id: userId },
        data: {
            roleId: 'admin',
        },
    });
}
export async function rejectAdminAction(formData: FormData) {
    const userId = formData.get('userId')?.toString();

    if (!userId) {
        throw new Error('Invalid userId');
    }

    await caDb.user.delete({
        where: { id: userId },
    });

    revalidatePath('/admin/pending');
}
