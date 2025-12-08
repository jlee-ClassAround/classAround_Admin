"use server";

import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { ChapterSchema } from "@/validations/schemas";

export async function postChapter({
  courseId,
  values,
}: {
  courseId: string;
  values: ChapterSchema;
}) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) return null;

    const lastChapter = await db.chapter.findFirst({
      where: {
        courseId,
      },
      orderBy: {
        position: "desc",
      },
      select: {
        position: true,
      },
    });
    const newPosition = lastChapter ? lastChapter.position + 1 : 1;

    const newChapter = await db.chapter.create({
      data: {
        ...values,
        courseId,
        position: newPosition,
      },
    });

    return newChapter;
  } catch (e) {
    console.log("[POST_CHAPTER_ERROR]", e);
    return null;
  }
}
