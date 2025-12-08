import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { courseIds }: { courseIds: string[] } = await req.json();

    await db.course.deleteMany({
      where: {
        id: {
          in: courseIds,
        },
      },
    });

    revalidateTag("courses");
    revalidateTag("best-courses");
    revalidateTag("free-courses");
    courseIds.forEach((courseId) => {
      revalidateTag(`course-${courseId}`);
    });

    return new NextResponse("Success", { status: 200 });
  } catch (e) {
    console.error("[COURSES_DELETE_ERROR]", e);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
