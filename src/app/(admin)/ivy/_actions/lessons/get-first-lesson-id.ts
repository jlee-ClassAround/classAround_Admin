'use server';

import { ivyDb } from '@/lib/ivyDb';

interface Props {
    courseId: string;
}

export async function getFirstLessonId({ courseId }: Props) {
    try {
        const lesson = await ivyDb.lesson.findFirst({
            where: {
                chapter: {
                    isPublished: true,
                    courseId,
                },
                isPublished: true,
            },
            orderBy: {
                position: 'asc',
            },
            select: {
                id: true,
            },
        });
        if (!lesson) return null;

        return lesson.id;
    } catch (e) {
        console.log('[GET_FIRST_LESSON_ID_ERROR]', e);
        return null;
    }
}
