"use server";

import { db } from "@/lib/db";
import { CourseOption, User, Enrollment } from "@prisma/client";

interface Props {
  courseId: string;
}

export type EnrolledUser = User & {
  progress: number;
  courseOption: CourseOption | null;
  enrollmentId: string;
  enrollment: {
    createdAt: Date;
    endDate: Date | null;
  };
};

export async function getEnrolledUsers({ courseId }: Props) {
  try {
    // 1. 먼저 모든 enrollment와 관련 데이터를 한 번에 조회
    const enrollments = await db.enrollment.findMany({
      where: {
        courseId,
        isActive: true,
      },
      include: {
        user: true,
        courseOption: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 2. 모든 학생들의 progress를 한 번의 쿼리로 조회
    const userIds = enrollments.map((enrollment) => enrollment.userId);

    const progressResults = await db.userProgress.groupBy({
      by: ["userId"],
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
    const totalLessons = await db.lesson.count({
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
          courseOption: enrollment.courseOption,
          progress: progressMap.get(enrollment.userId) || 0,
          enrollmentId: enrollment.id,
          enrollment: {
            createdAt: enrollment.createdAt,
            endDate: enrollment.endDate,
          },
        } as EnrolledUser)
    );

    return enrolledUsers;
  } catch (e) {
    console.log("[GET_ENROLLED_USERS_ERROR]", e);
    return [];
  }
}
