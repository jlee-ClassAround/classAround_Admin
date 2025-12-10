'use server';

import { getIsAdmin } from '@/lib/is-admin';
import { cojoobooDb } from '@/lib/cojoobooDb';

export async function postLesson({
    values,
    chapterId,
}: {
    values: { title: string };
    chapterId: string;
}) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return null;

        const lastLesson = await cojoobooDb.lesson.findFirst({
            where: {
                chapterId,
            },
            orderBy: {
                position: 'desc',
            },
            select: {
                position: true,
            },
        });

        const newPosition = lastLesson ? lastLesson.position + 1 : 1;

        const lesson = await cojoobooDb.lesson.create({
            data: {
                ...values,
                position: newPosition,
                chapterId,
            },
        });

        return lesson;
    } catch (e) {
        console.log('[POST_LESSON_ERROR]', e);
        return null;
    }
}
