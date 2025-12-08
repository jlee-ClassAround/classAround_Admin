"use server";

import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { UserDataSchema } from "@/validations/schemas";

export async function updateUser(userId: string, values: UserDataSchema) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  await db.user.update({
    where: { id: userId },
    data: values,
  });

  return true;
}
