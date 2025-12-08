"use server";

import { db } from "@/lib/db";
import { unstable_cache as nextCache } from "next/cache";

export async function getSingleTeacher(teacherId: string) {
  const teacher = await db.teacher.findUnique({
    where: {
      id: teacherId,
    },
    include: {
      courses: {
        where: {
          isPublished: true,
          isHidden: false,
        },
        include: {
          category: true,
          teachers: true,
          productBadge: true,
        },
      },
      freeCourses: {
        where: {
          isPublished: true,
          isHidden: false,
        },
        include: {
          category: true,
          teachers: true,
          productBadge: true,
        },
      },
    },
  });
  return teacher;
}

export async function getCachedSingleTeacher(teacherId: string) {
  const cache = nextCache(getSingleTeacher, [`teacher-${teacherId}`], {
    tags: [`teacher-${teacherId}`],
    revalidate: 60 * 60 * 24,
  });

  return cache(teacherId);
}
