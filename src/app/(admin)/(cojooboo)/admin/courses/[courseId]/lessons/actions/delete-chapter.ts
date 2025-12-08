"use server";

import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";

export async function deleteChapter({ chapterId }: { chapterId: string }) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) return null;

    await db.chapter.delete({
      where: {
        id: chapterId,
      },
    });

    return true;
  } catch (e) {
    console.log("[DELETE_CHAPTER_ERROR]", e);
    return false;
  }
}
