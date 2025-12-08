"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

interface Props {
  currentPage: number;
  pageSize: number;
}

export async function getVodCourses({ currentPage, pageSize }: Props) {
  try {
    const where: Prisma.CourseWhereInput = {
      categoryId: "a9d9af7b-f975-4ce4-a382-8ec80107d5a1",
    };

    const courses = await db.course.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      include: {
        productBadge: true,
        teachers: true,
        category: true,
      },
    });

    const totalCount = await db.course.count({
      where,
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      courses: courses.map((course) => ({
        ...course,
        courseType: "PAID" as const,
      })),
      totalPages,
    };
  } catch (error) {
    console.error(error);
    return { courses: [], totalPages: 0 };
  }
}
