import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const isAdmin = getIsAdmin();
    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title } = await req.json();

    const course = await db.course.create({
      data: {
        title,
      },
      select: {
        id: true,
      },
    });

    revalidateTag("courses");
    revalidateTag("best-courses");
    revalidateTag("free-courses");

    return NextResponse.json(course);
  } catch (e) {
    console.log("[COURSE_CREATE_ERROR]", e);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
