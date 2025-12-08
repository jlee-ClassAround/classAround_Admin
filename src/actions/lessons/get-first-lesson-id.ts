"use server";

import { db } from "@/lib/db";

interface Props {
  courseId: string;
}

export async function getFirstLessonId({ courseId }: Props) {
  try {
    const lesson = await db.lesson.findFirst({
      where: {
        chapter: {
          isPublished: true,
          courseId,
        },
        isPublished: true,
      },
      orderBy: {
        position: "asc",
      },
      select: {
        id: true,
      },
    });
    if (!lesson) return null;

    return lesson.id;
  } catch (e) {
    console.log("[GET_FIRST_LESSON_ID_ERROR]", e);
    return null;
  }
}
