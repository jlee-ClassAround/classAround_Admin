"use server";

import { db } from "@/lib/db";
import { unstable_cache as nextCache } from "next/cache";

export async function getMainTeachers() {
  try {
    const teachers = await db.teacher.findMany({
      where: {
        isPublished: true,
      },
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
    });

    return teachers;
  } catch {
    return [];
  }
}

export async function getCachedMainTeachers() {
  const cache = nextCache(getMainTeachers, ["main-teachers"], {
    tags: ["main-teachers"],
    revalidate: 60 * 60 * 24,
  });

  return cache();
}
