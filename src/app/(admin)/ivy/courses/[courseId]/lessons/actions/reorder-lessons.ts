'use server';

import { getIsAdmin } from '@/lib/is-admin';
import { cojoobooDb } from '@/lib/cojoobooDb';

export async function reorderLessons({
    lessonList,
}: {
    lessonList: { id: string; position: number }[];
}) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return null;

        for (const item of lessonList) {
            await cojoobooDb.lesson.update({
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
        console.log('[REORDER_LESSONS_ERROR]', e);
        return null;
    }
}
