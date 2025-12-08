import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { courseId } = await params;
    const { isIncludeChapters } = await req.json();

    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          include: {
            lessons: true,
          },
        },
      },
    });
    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    const { chapters, ...courseData } = course;

    const newCourse = await db.course.create({
      data: {
        ...courseData,
        id: uuidv4(),
        title: course.title + "-복제됨",
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      select: {
        id: true,
      },
    });

    if (isIncludeChapters) {
      for (const chapter of chapters) {
        const { lessons, ...chaptersData } = chapter;

        const newChapter = await db.chapter.create({
          data: {
            ...chaptersData,
            id: uuidv4(),
            courseId: newCourse.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          select: {
            id: true,
          },
        });

        if (lessons.length > 0) {
          await db.lesson.createMany({
            data: lessons.map((lesson) => ({
              ...lesson,
              id: uuidv4(),
              chapterId: newChapter.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            })),
          });
        }
      }
    }

    revalidateTag("courses");
    revalidateTag("best-courses");
    revalidateTag("free-courses");

    return NextResponse.json({ message: "Course duplicated" });
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
