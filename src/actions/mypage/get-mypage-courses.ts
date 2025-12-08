"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { getUserProgress } from "../lessons/get-user-progress";
import { Category, Course, Teacher } from "@prisma/client";
import { getIsEnrollment } from "../enrollments/get-is-enrollment";

export type coursesWithProgress = Course & {
  progress: number | null;
  category: Category;
  teachers: Teacher[];
  isCompleted: boolean;
  expiredAt: Date | null;
  isActive: boolean;
};

type GetMypageCourses = {
  completedCourses: coursesWithProgress[];
  inProgressCourses: coursesWithProgress[];
};

export async function getMypageCourses(): Promise<GetMypageCourses> {
  try {
    const session = await getSession();
    if (!session.id)
      return {
        completedCourses: [],
        inProgressCourses: [],
      };

    const enrollments = await db.enrollment.findMany({
      where: {
        userId: session.id,
        course: {
          isPublished: true,
        },
      },
      include: {
        course: {
          include: {
            category: true,
            teachers: true,
          },
        },
      },
    });

    const enrolledCourses = enrollments.map((item) => ({
      ...item.course,
      expiredAt: item.endDate,
    })) as coursesWithProgress[];

    for (const course of enrolledCourses) {
      const percentage = await getUserProgress({
        courseId: course.id,
        userId: session.id,
      });
      const isActive = await getIsEnrollment(course.id, session.id);
      const isCompleted = percentage === 100;
      course.progress = percentage;
      course.isCompleted = isCompleted;
      course.isActive = isActive;
    }

    const completedCourses = enrolledCourses.filter(
      // (course) => course.progress === 100
      (course) => course.isCompleted
    );
    const inProgressCourses = enrolledCourses.filter(
      // (course) => (course.progress ?? 0) < 100
      (course) => !course.isCompleted
    );

    return {
      completedCourses,
      inProgressCourses,
    };
  } catch (e) {
    console.log("[GET_MYPAGE_COURSES_ERROR]", e);
    return {
      completedCourses: [],
      inProgressCourses: [],
    };
  }
}
