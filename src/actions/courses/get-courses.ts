"use server";

import { db } from "@/lib/db";
import { unstable_cache as nextCache } from "next/cache";

interface Props {
  categoryId?: string;
  currentPage?: number;
  pageSize?: number;
}

export async function getCourses({
  categoryId,
  currentPage = 1,
  pageSize = 12,
}: Props) {
  try {
    const courses = await db.course.findMany({
      where: {
        isPublished: true,
        isHidden: false,
        categoryId,
      },
      include: {
        teachers: true,
        category: true,
        productBadge: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: pageSize,
      skip: (currentPage - 1) * pageSize,
    });
    const totalCount = await db.course.count({
      where: {
        isPublished: true,
        isHidden: false,
        categoryId,
      },
    });

    return { courses, totalCount };
  } catch {
    return { courses: [], totalCount: 0 };
  }
}

export async function getCachedCourses(props: Props) {
  const cache = nextCache(
    getCourses,
    [`${props.categoryId ? `courses-${props.categoryId}` : "courses"}`],
    {
      tags: [
        `${props.categoryId ? `courses-${props.categoryId}` : "courses"}`,
        "courses",
      ],
      revalidate: 60 * 60 * 24,
    }
  );

  return cache(props);
}
