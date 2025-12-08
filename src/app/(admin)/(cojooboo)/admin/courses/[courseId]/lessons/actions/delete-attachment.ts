"use server";

import { db } from "@/lib/db";

export async function deleteAttachment({
  attachmentId,
}: {
  attachmentId: string;
}) {
  await db.attachment.delete({
    where: { id: attachmentId },
  });
}
