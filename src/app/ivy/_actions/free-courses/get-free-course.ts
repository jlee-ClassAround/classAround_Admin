"use server";

import { db } from "@/lib/db";
import {
  Category,
  DetailImage,
  FreeCourse,
  ProductBadge,
  Teacher,
} from "@prisma/client";
import { unstable_cache as nextCache } from "next/cache";

export interface GetFreeCourse extends FreeCourse {
  detailImages: DetailImage[];
  teachers: Teacher[];
  category: Category | null;
  productBadge: ProductBadge[];
}

type GetFreeCourseResponse = GetFreeCourse | null;

export async function getFreeCourse(
  freeCourseId: string
): Promise<GetFreeCourseResponse> {
  const course = await db.freeCourse.findUnique({
    where: {
      id: freeCourseId,
      isPublished: true,
    },
    include: {
      detailImages: {
        orderBy: {
          position: "asc",
        },
      },
      teachers: true,
      category: true,
      productBadge: true,
    },
  });

  return course;
}

export async function getCachedFreeCourse(freeCourseId: string) {
  const cache = nextCache(getFreeCourse, [`free-course-${freeCourseId}`], {
    tags: [`free-course-${freeCourseId}`, "single-free-course"],
    revalidate: 60 * 60 * 3,
  });

  return cache(freeCourseId);
}
