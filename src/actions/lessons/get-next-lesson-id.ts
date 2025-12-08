"use server";

import { db } from "@/lib/db";

interface Props {
  lessonId: string;
}

export async function getNextLessonId({ lessonId }: Props) {
  try {
    const lesson = await db.lesson.findUnique({
      where: {
        id: lessonId,
        isPublished: true,
      },
    });
    if (!lesson) return null;
    const nextLesson = await db.lesson.findFirst({
      where: {
        chapterId: lesson.chapterId,
        isPublished: true,
        position: {
          gt: lesson.position,
        },
      },
      orderBy: {
        position: "asc",
      },
    });
    const chapter = await db.chapter.findUnique({
      where: {
        id: lesson.chapterId,
        isPublished: true,
      },
      select: {
        courseId: true,
        position: true,
      },
    });
    if (!chapter) return null;
    const nextChapter = await db.chapter.findFirst({
      where: {
        courseId: chapter.courseId,
        isPublished: true,
        position: {
          gt: chapter.position,
        },
      },
      orderBy: {
        position: "asc",
      },
      include: {
        lessons: {
          where: {
            isPublished: true,
          },
          take: 1,
          orderBy: {
            position: "asc",
          },
          select: {
            id: true,
          },
        },
      },
    });

    const nextLessonId = nextLesson
      ? nextLesson.id
      : nextChapter
      ? nextChapter.lessons?.[0].id
      : null;

    return nextLessonId;
  } catch (e) {
    console.log("[NEXT_LESSON_ID_ERROR]", e);
    return null;
  }
}
