import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) return new NextResponse("Unauthorized", { status: 401 });

    const { courseId, chapterId } = await params;

    const course = await db.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        id: true,
      },
    });
    if (!course) return new NextResponse("Course not found", { status: 404 });

    await db.chapter.delete({
      where: {
        id: chapterId,
      },
    });

    return new NextResponse("Chapter deleted", { status: 200 });
  } catch (e) {
    console.log("[CHAPTER_ID_DELETE_ERROR]", e);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
