"use server";

import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";

export async function deleteLesson({ lessonId }: { lessonId: string }) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) return null;

    await db.lesson.delete({
      where: { id: lessonId },
    });
    return true;
  } catch (e) {
    console.log("[DELETE_LESSON_ERROR]", e);
    return null;
  }
}
