'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import { Course } from '@/generated/cojooboo';
import { getUserProgress } from '../lessons/get-user-progress';

interface Props {
    userId: string;
}

export type EnrolledCourse = Course & {
    progress: number;
};

export async function getEnrolledCourses({ userId }: Props) {
    try {
        const enrollments = await cojoobooDb.enrollment.findMany({
            where: {
                userId,
                isActive: true,
            },
            include: {
                course: true,
            },
        });

        const enrolledCourses = enrollments.map(
            (enrollment) => enrollment.course as EnrolledCourse
        );

        for (const course of enrolledCourses) {
            const progress = await getUserProgress({ courseId: course.id, userId });
            course.progress = progress;
        }

        return enrolledCourses;
    } catch (e) {
        console.log('[GET_ENROLLED_COURSES_ERROR]', e);
        return [];
    }
}
