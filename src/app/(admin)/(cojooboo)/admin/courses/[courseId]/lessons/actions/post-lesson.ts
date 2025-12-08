"use server";

import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";

export async function postLesson({
  values,
  chapterId,
}: {
  values: { title: string };
  chapterId: string;
}) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) return null;

    const lastLesson = await db.lesson.findFirst({
      where: {
        chapterId,
      },
      orderBy: {
        position: "desc",
      },
      select: {
        position: true,
      },
    });

    const newPosition = lastLesson ? lastLesson.position + 1 : 1;

    const lesson = await db.lesson.create({
      data: {
        ...values,
        position: newPosition,
        chapterId,
      },
    });

    return lesson;
  } catch (e) {
    console.log("[POST_LESSON_ERROR]", e);
    return null;
  }
}
