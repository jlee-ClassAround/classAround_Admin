'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';

export async function getAppliedFreeCourse(userId: string, freeCourseId: string) {
    try {
        const applyCourse = await cojoobooDb.applyCourse.findUnique({
            where: {
                userId_freeCourseId: {
                    userId,
                    freeCourseId,
                },
            },
        });

        return applyCourse;
    } catch (e) {
        console.log('[APPLY_FREE_COURSE_ERROR]', e);
        return null;
    }
}
