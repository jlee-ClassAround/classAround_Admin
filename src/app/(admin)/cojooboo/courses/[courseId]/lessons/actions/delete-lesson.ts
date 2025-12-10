'use server';

import { getIsAdmin } from '@/lib/is-admin';
import { cojoobooDb } from '@/lib/cojoobooDb';

export async function deleteLesson({ lessonId }: { lessonId: string }) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return null;

        await cojoobooDb.lesson.delete({
            where: { id: lessonId },
        });
        return true;
    } catch (e) {
        console.log('[DELETE_LESSON_ERROR]', e);
        return null;
    }
}
