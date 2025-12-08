"use server";

import { db } from "@/lib/db";

interface Props {
  isPublished?: boolean;
  userId?: string;
  categoryId?: string;
  searchQuery?: string;
}

export async function getAdminCourses({
  isPublished,
  userId,
  categoryId,
  searchQuery,
}: Props = {}) {
  try {
    let whereClause: any = {};

    // 공개 여부 필터
    if (typeof isPublished === "boolean") {
      whereClause.isPublished = isPublished;
    }

    // 작성자 필터
    if (userId) {
      whereClause.userId = userId;
    }

    // 카테고리 필터
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    // 검색어 필터
    if (searchQuery) {
      whereClause.OR = [
        {
          title: {
            contains: searchQuery,
          },
        },
        {
          description: {
            contains: searchQuery,
          },
        },
      ];
    }

    const courses = await db.course.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return courses;
  } catch (error) {
    console.error("[GET_COURSES_ERROR]", error);
    throw new Error("강의 목록을 불러오는데 실패했습니다.");
  }
}
