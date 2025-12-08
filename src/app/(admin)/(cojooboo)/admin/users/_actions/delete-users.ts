"use server";

import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";

export async function deleteUsers(userIds: string[]) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const targetUsers = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, roleId: true },
  });

  if (!targetUsers.length) {
    throw new Error("삭제할 사용자를 찾을 수 없습니다.");
  }

  const hasSuperAdmin = targetUsers.some(
    (user) => user.roleId === "super-admin"
  );

  if (hasSuperAdmin) {
    throw new Error("슈퍼 관리자 계정은 삭제할 수 없습니다.");
  }

  await db.user.deleteMany({
    where: { id: { in: userIds } },
  });
}
