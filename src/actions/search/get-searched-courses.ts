"use server";

import { db } from "@/lib/db";

interface Props {
  categoryId?: string;
  title?: string;
}

export async function getSearchedCourses({ categoryId, title }: Props) {
  try {
    const courses = await db.course.findMany({
      where: {
        isPublished: true,
        categoryId,
        title: {
          contains: title,
        },
      },
      include: {
        teachers: true,
        category: true,
        productBadge: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return courses;
  } catch (e) {
    console.log("[SEARCHED_COURSES_ERROR]", e);
    return [];
  }
}
