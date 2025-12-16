'use server';

import { ivyDb } from '@/lib/ivyDb';
import { partialCourseSchema } from '@/lib/ivy/schemas';

export async function createPartialCourse(values: any) {
    const parsed = partialCourseSchema.safeParse(values);
    if (!parsed.success) {
        return { ok: false, error: parsed.error.errors };
    }

    try {
        const created = await ivyDb.partialCourse.create({
            data: {
                ...parsed.data,
                mainId: values.mainId, // form 밖에서 넣는 값
            },
        });

        return { ok: true, data: created };
    } catch (error) {
        console.error('[CREATE_PARTIAL_COURSE_ERROR]', error);
        return { ok: false, error: 'Server error' };
    }
}
