"use server";

import { db } from "@/lib/db";

interface Props {
  courseId: string;
  userId: string;
}

type GetUserProgress = Promise<number>;

export async function getUserProgress({
  courseId,
  userId,
}: Props): GetUserProgress {
  try {
    const course = await db.course.findUnique({
      where: {
        id: courseId,
        isPublished: true,
      },
      select: {
        chapters: {
          where: {
            isPublished: true,
          },
          select: {
            lessons: {
              where: {
                isPublished: true,
              },
              select: {
                id: true,
              },
            },
          },
        },
      },
    });
    if (!course) return 0;

    const lessonIds = course.chapters
      .flatMap((chapter) => chapter.lessons)
      .map((lesson) => lesson.id);

    const completedProgressCount = await db.userProgress.count({
      where: {
        userId,
        lessonId: {
          in: lessonIds,
        },
        isCompleted: true,
      },
    });

    const progressPercentage =
      (completedProgressCount / lessonIds.length) * 100;

    if (isNaN(progressPercentage)) {
      return 0;
    } else {
      return Math.round(progressPercentage);
    }
  } catch (e) {
    console.log("[USER_PROGRESS_ERROR]", e);
    return 0;
  }
}
