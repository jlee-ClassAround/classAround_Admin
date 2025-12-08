import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    const isAdmin = getIsAdmin();
    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const values = await req.json();
    const { teacherId } = await params;

    await db.teacher.update({
      where: {
        id: teacherId,
      },
      data: {
        ...values,
      },
    });

    revalidateTag("main-teachers");
    revalidateTag("teachers");
    revalidateTag(`teacher-${teacherId}`);

    return NextResponse.json({ message: "Teacher updated successfully" });
  } catch (e) {
    console.log("[TEACHER_ID_PUT_ERROR]", e);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    const isAdmin = getIsAdmin();
    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { teacherId } = await params;

    await db.teacher.delete({
      where: {
        id: teacherId,
      },
    });

    revalidateTag("main-teachers");
    revalidateTag("teachers");
    revalidateTag(`teacher-${teacherId}`);

    return NextResponse.json({ message: "Teacher deleted successfully" });
  } catch (e) {
    console.log("[TEACHER_ID_DELETE_ERROR]", e);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
