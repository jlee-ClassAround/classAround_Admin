"use server";

import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";

export async function deleteUser(userId: string) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const targetUser = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, roleId: true },
  });

  if (!targetUser) {
    throw new Error("User not found");
  }

  if (targetUser.roleId === "super-admin") {
    throw new Error("슈퍼 관리자 계정은 삭제할 수 없습니다.");
  }

  await db.user.delete({
    where: { id: userId },
  });
}
