'use server';

import { ivyDb } from '@/lib/ivyDb';

export async function deletePartialCourse(id: string) {
    try {
        await ivyDb.partialCourse.delete({
            where: { id },
        });

        return { ok: true };
    } catch (error) {
        console.error('[DELETE_PARTIAL_COURSE_ERROR]', error);

        return {
            ok: false,
            error: 'Server error',
        };
    }
}
