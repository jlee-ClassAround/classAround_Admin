'use server';

import { getIsAdmin } from '@/lib/is-admin';
import { ivyDb } from '@/lib/ivyDb';

export async function deleteLesson({ lessonId }: { lessonId: string }) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return null;

        await ivyDb.lesson.delete({
            where: { id: lessonId },
        });
        return true;
    } catch (e) {
        console.log('[DELETE_LESSON_ERROR]', e);
        return null;
    }
}
