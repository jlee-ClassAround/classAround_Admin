"use server";

import { getIsAdmin } from "@/utils/auth/is-admin";
import { db } from "@/lib/db";

export async function deleteApply(applyId: string) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  await db.applyCourse.delete({
    where: {
      id: applyId,
    },
  });

  return {
    success: true,
  };
}
