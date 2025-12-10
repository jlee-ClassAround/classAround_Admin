'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import { getIsAdmin } from '@/lib/is-admin';
import { revalidateTag } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

export async function deleteEbookAction(id: string) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return { success: false, error: 'Unauthorized' };

        await cojoobooDb.ebook.delete({
            where: { id },
        });

        revalidateTag('ebooks');
        revalidateTag(`ebook-${id}`);

        return { success: true };
    } catch (e) {
        console.error('[EBOOK_DELETE_ERROR]', e);
        return { success: false, error: 'Internal Server Error' };
    }
}

export async function deleteManyEbooksAction(ids: string[]) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return { success: false, error: 'Unauthorized' };

        await cojoobooDb.ebook.deleteMany({
            where: { id: { in: ids } },
        });

        revalidateTag('ebooks');
        ids.forEach((id) => revalidateTag(`ebook-${id}`));

        return { success: true };
    } catch (e) {
        console.error('[EBOOKS_DELETE_ERROR]', e);
        return { success: false, error: 'Internal Server Error' };
    }
}
export async function duplicateEbookAction(id: string) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return { success: false, error: 'Unauthorized' };

        const ebook = await cojoobooDb.ebook.findUnique({
            where: { id },
        });

        if (!ebook) return { success: false, error: 'Ebook not found' };

        const newId = uuidv4();

        await cojoobooDb.ebook.create({
            data: {
                ...ebook,
                id: newId,
                title: ebook.title + ' - 복제됨',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });

        revalidateTag('ebooks');
        revalidateTag(`ebook-${id}`);

        return { success: true, id: newId };
    } catch (e) {
        console.error('[EBOOK_DUPLICATE_ERROR]', e);
        return { success: false, error: 'Internal Server Error' };
    }
}
