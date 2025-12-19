'use server';

import { getIsAdmin } from '@/lib/is-admin';
import { cojoobooDb } from '@/lib/cojoobooDb';

export async function editLesson({ lessonId, values }: { lessonId: string; values: any }) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return null;

        const lesson = await cojoobooDb.lesson.update({
            where: { id: lessonId },
            data: values,
        });
        return lesson;
    } catch (e) {
        console.log('[EDIT_LESSON_ERROR]', e);
        return null;
    }
}
