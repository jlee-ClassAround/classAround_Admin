"use server";

import { db } from "@/lib/db";

export const getUser = async (userId: string | undefined) => {
  try {
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
    });

    return user;
  } catch {
    return null;
  }
};
