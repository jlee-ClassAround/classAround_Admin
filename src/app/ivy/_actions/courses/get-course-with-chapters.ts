'use server';

import { ivyDb } from '@/lib/ivyDb';

export async function getCourseChapters(courseId: string) {
    try {
        const course = await ivyDb.course.findUnique({
            where: {
                id: courseId,
            },
            include: {
                chapters: {
                    include: {
                        lessons: {
                            orderBy: {
                                position: 'asc',
                            },
                        },
                    },
                    orderBy: {
                        position: 'asc',
                    },
                },
            },
        });
        if (!course) return [];

        return course.chapters;
    } catch (e) {
        console.log('[GET_COURSE_WITH_CHAPTER_ERROR]', e);
        return [];
    }
}
