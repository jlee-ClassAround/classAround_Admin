"use server";

import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";

export async function getUsersAppliedFreeCourse(freeCourseId?: string) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) return [];

    const applyCourses = await db.applyCourse.findMany({
      where: {
        freeCourseId,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const users = applyCourses.map((apply) => ({
      ...apply.user,
      appliedAt: apply.createdAt,
      applyId: apply.id,
    }));

    return users;
  } catch {
    return [];
  }
}
