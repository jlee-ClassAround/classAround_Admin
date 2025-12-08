import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ faqId: string }> }
) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { faqId } = await params;

    const values = await req.json();
    const faq = await db.faq.update({
      where: { id: Number(faqId) },
      data: {
        ...values,
      },
    });

    revalidateTag("main-faqs");
    revalidateTag("faqs");

    return NextResponse.json({ faq });
  } catch (e) {
    console.log("[FAQS_UPDATE]", e);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ faqId: string }> }
) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { faqId } = await params;

    await db.faq.delete({
      where: { id: Number(faqId) },
    });

    revalidateTag("main-faqs");
    revalidateTag("faqs");

    return NextResponse.json({ success: true });
  } catch (e) {
    console.log("[FAQS_DELETE]", e);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
