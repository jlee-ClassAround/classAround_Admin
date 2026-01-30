'use server';

import { ivyDb } from '@/lib/ivyDb';
import { CourseOption, User } from '@/generated/ivy';

interface Props {
    courseId: string;
}

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
        // 1. 먼저 모든 enrollment와 관련 데이터를 한 번에 조회
        const enrollments = await ivyDb.enrollment.findMany({
            where: {
                courseId,
            },
            include: {
                user: true,
                courseOption: true,
            },
        });

        // 2. 모든 학생들의 progress를 한 번의 쿼리로 조회
        const userIds = enrollments.map((enrollment) => enrollment.userId);

        const progressResults = await ivyDb.userProgress.groupBy({
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

        // 3. 전체 강의 수 조회
        const totalLessons = await ivyDb.lesson.count({
            where: {
                chapter: {
                    courseId: courseId,
                },
                isPublished: true,
            },
        });

        // 4. Progress 계산을 위한 Map 생성
        const progressMap = new Map(
            progressResults.map((result) => [
                result.userId,
                Math.round((result._count.lessonId / totalLessons) * 100),
            ])
        );

        // 5. 최종 데이터 조합
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
