import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const isAdmin = getIsAdmin();
    if (!isAdmin) return new NextResponse("Unauthozied", { status: 401 });

    const { courseId } = await params;
    const course = await db.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        id: true,
      },
    });
    if (!course) return new NextResponse("Not Found Course", { status: 404 });

    const lastChapter = await db.chapter.findFirst({
      where: {
        courseId,
      },
      orderBy: {
        position: "desc",
      },
      select: {
        position: true,
      },
    });
    const newPosition = lastChapter ? lastChapter.position + 1 : 1;

    const values = await req.json();

    const newChapter = await db.chapter.create({
      data: {
        ...values,
        courseId,
        position: newPosition,
      },
    });

    return NextResponse.json(newChapter);
  } catch (e) {
    console.log("[CHAPTER_POST_ERROR]", e);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
