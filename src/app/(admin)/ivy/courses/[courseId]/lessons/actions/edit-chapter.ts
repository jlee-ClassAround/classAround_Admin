'use server';

import { getIsAdmin } from '@/lib/is-admin';
import { ivyDb } from '@/lib/ivyDb';

export async function editChapter({ chapterId, values }: { chapterId: string; values: any }) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return null;

        const updatedChapter = await ivyDb.chapter.update({
            where: {
                id: chapterId,
            },
            data: {
                ...values,
            },
        });
        return updatedChapter;
    } catch (e) {
        console.log('[EDIT_CHAPTER_ERROR]', e);
        return null;
    }
}
