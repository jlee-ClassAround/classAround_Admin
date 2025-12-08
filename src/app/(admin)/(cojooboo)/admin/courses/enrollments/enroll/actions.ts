"use server";

import { db } from "@/lib/db";

export const getUsersWithPhone = async (phoneArr: string[]) => {
  try {
    const users = await db.user.findMany({
      where: {
        phone: {
          in: phoneArr,
        },
      },
      select: {
        id: true,
        username: true,
        phone: true,
        email: true,
      },
    });

    return users;
  } catch (error) {
    console.error(error);
    return [];
  }
};
