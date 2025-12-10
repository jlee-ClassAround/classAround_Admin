'use server';

import { getIsAdmin } from '@/lib/is-admin';
import { cojoobooDb } from '@/lib/cojoobooDb';

export async function deleteChapter({ chapterId }: { chapterId: string }) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return null;

        await cojoobooDb.chapter.delete({
            where: {
                id: chapterId,
            },
        });

        return true;
    } catch (e) {
        console.log('[DELETE_CHAPTER_ERROR]', e);
        return false;
    }
}
