import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const values = await req.json();
    const event = await db.event.create({
      data: {
        ...values,
      },
    });
    return NextResponse.json({ event }, { status: 201 });
  } catch (e) {
    console.log("[EVENTS_CREATE]", e);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { ids } = await req.json();

    await db.event.deleteMany({ where: { id: { in: ids } } });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.log("[EVENTS_DELETE] /api/boards/events", e);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
