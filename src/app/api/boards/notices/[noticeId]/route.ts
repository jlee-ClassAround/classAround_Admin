import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ noticeId: string }> }
) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { noticeId } = await params;

    const values = await req.json();
    const notice = await db.notice.update({
      where: { id: Number(noticeId) },
      data: {
        ...values,
      },
    });

    revalidateTag("notices");
    revalidateTag(`notice-${notice.id}`);

    return NextResponse.json({ notice });
  } catch (error) {
    console.log("[NOTICES_UPDATE] /api/boards/notices", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ noticeId: string }> }
) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { noticeId } = await params;

    const notice = await db.notice.delete({
      where: { id: Number(noticeId) },
    });

    revalidateTag("notices");
    revalidateTag(`notice-${notice.id}`);

    return NextResponse.json({ notice });
  } catch (e) {
    console.log("[NOTICES_DELETE] /api/boards/notices", e);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
