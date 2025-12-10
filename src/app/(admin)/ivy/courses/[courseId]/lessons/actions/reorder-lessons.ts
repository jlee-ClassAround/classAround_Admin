'use server';

import { getIsAdmin } from '@/lib/is-admin';
import { ivyDb } from '@/lib/ivyDb';

export async function reorderLessons({
    lessonList,
}: {
    lessonList: { id: string; position: number }[];
}) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return null;

        for (const item of lessonList) {
            await ivyDb.lesson.update({
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
