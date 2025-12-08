"use server";

import { db } from "@/lib/db";

export async function getCourseChapters(courseId: string) {
  try {
    const course = await db.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        chapters: {
          include: {
            lessons: {
              orderBy: {
                position: "asc",
              },
            },
          },
          orderBy: {
            position: "asc",
          },
        },
      },
    });
    if (!course) return [];

    return course.chapters;
  } catch (e) {
    console.log("[GET_COURSE_WITH_CHAPTER_ERROR]", e);
    return [];
  }
}
