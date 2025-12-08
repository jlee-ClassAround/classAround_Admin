"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

interface Props {
  lessonId: string;
}

export async function getIsLessonCompleted({ lessonId }: Props) {
  try {
    const session = await getSession();
    if (!session.id) return false;
    const userProgress = await db.userProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: session.id,
          lessonId,
        },
      },
      select: {
        isCompleted: true,
      },
    });
    const isCompleted = Boolean(userProgress?.isCompleted);

    return isCompleted;
  } catch (e) {
    console.log("IS_LESSON_COMPLETED_ERROR", e);
    return false;
  }
}
