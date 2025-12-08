"use server";

import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";

export async function editChapter({
  chapterId,
  values,
}: {
  chapterId: string;
  values: any;
}) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) return null;

    const updatedChapter = await db.chapter.update({
      where: {
        id: chapterId,
      },
      data: {
        ...values,
      },
    });
    return updatedChapter;
  } catch (e) {
    console.log("[EDIT_CHAPTER_ERROR]", e);
    return null;
  }
}
