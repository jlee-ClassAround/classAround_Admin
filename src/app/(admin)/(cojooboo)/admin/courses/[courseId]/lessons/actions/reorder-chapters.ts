"use server";

import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";

export async function reorderChapters({
  chapterList,
}: {
  chapterList: { id: string; position: number }[];
}) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) return null;

    for (const item of chapterList) {
      await db.chapter.update({
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
    console.log("[REORDER_CHAPTERS_ERROR]", e);
    return null;
  }
}
