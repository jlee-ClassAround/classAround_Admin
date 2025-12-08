"use server";

import { db } from "@/lib/db";
import { unstable_cache as nextCache } from "next/cache";

interface Props {
  categoryId?: string;
  currentPage?: number;
  pageSize?: number;
}

export async function getTeachers({
  categoryId,
  currentPage = 1,
  pageSize = 12,
}: Props) {
  try {
    const teachers = await db.teacher.findMany({
      where: {
        isPublished: true,
        categoryId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: pageSize,
      skip: (currentPage - 1) * pageSize,
    });
    const totalCount = await db.teacher.count({
      where: {
        isPublished: true,
        categoryId,
      },
    });

    return { teachers, totalCount };
  } catch {
    return { teachers: [], totalCount: 0 };
  }
}

export async function getCachedTeachers(props: Props) {
  const cache = nextCache(
    getTeachers,
    [`${props.categoryId ? "teachers-" + props.categoryId : "teachers"}`],
    {
      tags: [
        `${props.categoryId ? "teachers-" + props.categoryId : "teachers"}`,
        "teachers",
      ],
      revalidate: 60 * 60 * 24,
    }
  );

  return cache(props);
}
