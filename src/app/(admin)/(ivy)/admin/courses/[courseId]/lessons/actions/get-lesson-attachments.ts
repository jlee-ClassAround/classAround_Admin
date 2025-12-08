"use server";

import { db } from "@/lib/db";

export async function getLessonAttachments(lessonId: string) {
  try {
    const attachments = await db.attachment.findMany({
      where: {
        lessonId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return attachments;
  } catch {
    return [];
  }
}
