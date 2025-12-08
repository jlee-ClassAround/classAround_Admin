"use server";

import { db } from "@/lib/db";

export async function getAllUsersWithoutPagination() {
  const users = await db.user.findMany({
    where: {
      OR: [
        { roleId: null },
        {
          roleId: {
            notIn: ["admin", "super-admin"],
          },
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return users;
}
