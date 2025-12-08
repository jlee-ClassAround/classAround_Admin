import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const isAdmin = getIsAdmin();
    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { ids } = await req.json();

    await db.teacher.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    revalidateTag("main-teachers");
    revalidateTag("teachers");

    return NextResponse.json({ message: "Teachers deleted successfully" });
  } catch (e) {
    console.log("[TEACHER_DELETE_ERROR]", e);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
