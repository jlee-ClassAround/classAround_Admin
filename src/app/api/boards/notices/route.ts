import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const values = await req.json();
    const notice = await db.notice.create({
      data: {
        ...values,
      },
    });

    revalidateTag("notices");

    return NextResponse.json({ notice }, { status: 201 });
  } catch (error) {
    console.log("[NOTICES_CREATE] /api/boards/notices", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { ids }: { ids: number[] } = await req.json();

    const notice = await db.notice.deleteMany({ where: { id: { in: ids } } });

    revalidateTag("notices");
    ids.forEach((id) => {
      revalidateTag(`notice-${id}`);
    });

    return NextResponse.json({ notice });
  } catch (e) {
    console.log("[NOTICES_DELETE] /api/boards/notices", e);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
