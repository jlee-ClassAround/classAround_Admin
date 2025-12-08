"use server";

import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";

export async function reorderLessons({
  lessonList,
}: {
  lessonList: { id: string; position: number }[];
}) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) return null;

    for (const item of lessonList) {
      await db.lesson.update({
        where: {
          id: item.id,
        },
        data: {
          position: item.position,
        },
      });
    }

    return true;
  } catch (e) {
    console.log("[REORDER_LESSONS_ERROR]", e);
    return null;
  }
}
