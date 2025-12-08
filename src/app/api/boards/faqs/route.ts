import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: Request) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const values = await req.json();
    const faq = await db.faq.create({
      data: {
        ...values,
      },
    });

    revalidateTag("main-faqs");
    revalidateTag("faqs");

    return NextResponse.json({ faq }, { status: 201 });
  } catch (e) {
    console.log("[FAQS_CREATE]", e);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { ids } = await req.json();

    await db.faq.deleteMany({ where: { id: { in: ids } } });

    revalidateTag("main-faqs");
    revalidateTag("faqs");

    return NextResponse.json({ success: true });
  } catch (e) {
    console.log("[FAQS_DELETE] /api/boards/faqs", e);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
