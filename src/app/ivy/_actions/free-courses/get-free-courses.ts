"use server";

import { db } from "@/lib/db";
import { Category, FreeCourse, ProductBadge, Teacher } from "@prisma/client";
import { unstable_cache as nextCache } from "next/cache";

export interface IFreeCourse extends FreeCourse {
  teachers: Teacher[];
  category: Category | null;
  productBadge: ProductBadge[];
}

interface Props {
  categoryId?: string;
  currentPage?: number;
  pageSize?: number;
}

export async function getFreeCourses({
  categoryId,
  currentPage = 1,
  pageSize = 10,
}: Props): Promise<{ freeCourses: IFreeCourse[]; totalCount: number }> {
  try {
    const freeCourses = await db.freeCourse.findMany({
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

    const totalCount = await db.freeCourse.count({
      where: {
        isPublished: true,
        isHidden: false,
        categoryId,
      },
    });

    return { freeCourses, totalCount };
  } catch {
    return { freeCourses: [], totalCount: 0 };
  }
}

export async function getCachedFreeCourses(props: Props) {
  const cache = nextCache(
    getFreeCourses,
    [
      `${
        props.categoryId ? `free-courses-${props.categoryId}` : "free-courses"
      }`,
    ],
    {
      tags: [
        `${
          props.categoryId ? `free-courses-${props.categoryId}` : "free-courses"
        }`,
        "free-courses",
      ],
      revalidate: 60 * 60 * 24,
    }
  );

  return cache(props);
}
