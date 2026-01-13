'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import { CourseOption, User } from '@/generated/cojooboo';

interface Props {
    courseId: string;
}

// 💡 1. 타입 정의에 role 추가
export type EnrolledUser = User & {
    enrollmentId: string;
    progress: number;
    courseOption: CourseOption | null;
    endDate: Date | null;
    isActive: boolean;
    role: string | null;
};

export async function getEnrolledUsers({ courseId }: Props) {
    try {
        const enrollments = await cojoobooDb.enrollment.findMany({
            where: {
                courseId,
            },
            include: {
                user: true,
                courseOption: true,
            },
        });

        const userIds = enrollments.map((enrollment) => enrollment.userId);

        const progressResults = await cojoobooDb.userProgress.groupBy({
            by: ['userId'],
            where: {
                lesson: {
                    chapter: {
                        courseId,
                    },
                },
                userId: {
                    in: userIds,
                },
                isCompleted: true,
            },
            _count: {
                lessonId: true,
            },
        });

        const totalLessons = await cojoobooDb.lesson.count({
            where: {
                chapter: {
                    courseId: courseId,
                },
                isPublished: true,
            },
        });

        const progressMap = new Map(
            progressResults.map((result) => [
                result.userId,
                Math.round((result._count.lessonId / totalLessons) * 100),
            ])
        );

        const enrolledUsers = enrollments.map(
            (enrollment) =>
                ({
                    ...enrollment.user,
                    enrollmentId: enrollment.id,
                    courseOption: enrollment.courseOption,
                    progress: progressMap.get(enrollment.userId) || 0,
                    endDate: enrollment.endDate,
                    isActive: enrollment.isActive,
                    role: enrollment.role,
                } as EnrolledUser)
        );

        return enrolledUsers;
    } catch (e) {
        console.log('[GET_ENROLLED_USERS_ERROR]', e);
        return [];
    }
}
