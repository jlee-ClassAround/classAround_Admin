"use server";

import { db } from "@/lib/db";
import { getIsSuperAdmin } from "@/utils/auth/is-super-admin";

async function ensureSuperAdminPrivileges() {
  const isSuperAdmin = await getIsSuperAdmin();
  if (!isSuperAdmin) {
    throw new Error("Unauthorized");
  }
}

function normalizeRoleId(roleId: string | null | undefined) {
  if (!roleId || roleId === "none") {
    return null;
  }

  return roleId;
}

export async function updateUserRole(
  userId: string,
  nextRoleId: string | null
) {
  await ensureSuperAdminPrivileges();

  const targetUser = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, roleId: true },
  });

  if (!targetUser) {
    throw new Error("User not found");
  }

  const normalizedNextRoleId = normalizeRoleId(nextRoleId);

  if (
    targetUser.roleId === "super-admin" &&
    normalizedNextRoleId !== "super-admin"
  ) {
    throw new Error("슈퍼 관리자의 권한은 변경할 수 없습니다.");
  }

  if (targetUser.roleId === normalizedNextRoleId) {
    return true;
  }

  const availableRoles = await db.role
    .findMany({
      select: { id: true },
    })
    .then((roles) => roles.map((role) => role.id));

  if (normalizedNextRoleId && !availableRoles.includes(normalizedNextRoleId)) {
    throw new Error("지원하지 않는 권한입니다.");
  }

  await db.user.update({
    where: { id: userId },
    data: {
      roleId: normalizedNextRoleId,
    },
  });

  return true;
}
