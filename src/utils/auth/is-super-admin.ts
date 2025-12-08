"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function getIsSuperAdmin() {
  try {
    const session = await getSession();
    const user = await db.user.findUnique({
      where: {
        id: session.id,
      },
      select: {
        roleId: true,
      },
    });

    return user?.roleId === "super-admin";
  } catch {
    return false;
  }
}
