import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { eventId } = await params;

    const values = await req.json();
    const event = await db.event.update({
      where: { id: Number(eventId) },
      data: {
        ...values,
      },
    });
    return NextResponse.json({ event });
  } catch (e) {
    console.log("[EVENTS_UPDATE]", e);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { eventId } = await params;

    await db.event.delete({
      where: { id: Number(eventId) },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.log("[EVENTS_DELETE]", e);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
