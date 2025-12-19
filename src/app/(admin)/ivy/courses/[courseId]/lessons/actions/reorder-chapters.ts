'use server';

import { getIsAdmin } from '@/lib/is-admin';
import { ivyDb } from '@/lib/ivyDb';

export async function reorderChapters({
    chapterList,
}: {
    chapterList: { id: string; position: number }[];
}) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return null;

        for (const item of chapterList) {
            await ivyDb.chapter.update({
                where: {
                    id: item.id,
                },
                data: {
                    position: item.position,
                },
            });
        }

        return true;
    } catch (e) {
        console.log('[REORDER_CHAPTERS_ERROR]', e);
        return null;
    }
}
