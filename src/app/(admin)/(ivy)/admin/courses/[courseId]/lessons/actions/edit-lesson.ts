"use server";

import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";

export async function editLesson({
  lessonId,
  values,
}: {
  lessonId: string;
  values: any;
}) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) return null;

    const lesson = await db.lesson.update({
      where: { id: lessonId },
      data: values,
    });
    return lesson;
  } catch (e) {
    console.log("[EDIT_LESSON_ERROR]", e);
    return null;
  }
}
