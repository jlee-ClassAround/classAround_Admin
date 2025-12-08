"use server";

import { db } from "@/lib/db";

export async function createAttachment({
  lessonId,
  name,
  url,
}: {
  lessonId: string;
  name: string;
  url: string;
}) {
  await db.attachment.create({
    data: {
      lessonId,
      name,
      url,
    },
  });
}
