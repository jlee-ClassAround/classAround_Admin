'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import { getSession } from '@/lib/session';
import { FreeCourse } from '@/generated/cojooboo';

export async function getAppliedFreeCourses(): Promise<FreeCourse[]> {
    try {
        const session = await getSession();
        if (!session.id) return [];

        const userApplied = await cojoobooDb.applyCourse.findMany({
            where: {
                userId: session.id,
            },
            include: {
                freeCourse: true,
            },
        });

        const appliedFreeCourses = userApplied.map((applied) => applied.freeCourse);
        const filteredAppliedFreeCourses = appliedFreeCourses.filter(
            (course) => course.isPublished
        );

        return filteredAppliedFreeCourses;
    } catch (error) {
        console.log('getAppliedFreeCourses error', error);
        return [];
    }
}
