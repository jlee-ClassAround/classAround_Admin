import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ badgeId: string }> }
) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) return new NextResponse("Unauthorized", { status: 401 });

    const values = await req.json();

    const { badgeId } = await params;

    const badge = await db.productBadge.update({
      where: {
        id: badgeId,
      },
      data: {
        ...values,
      },
    });

    revalidateTag("best-courses");
    revalidateTag("single-course");
    revalidateTag("free-courses");
    revalidateTag("single-free-course");
    revalidateTag("ebooks");
    revalidateTag("single-ebook");

    return NextResponse.json({ message: "Product badge updated" });
  } catch (error) {
    console.log("[PRODUCT_BADGE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ badgeId: string }> }
) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) return new NextResponse("Unauthorized", { status: 401 });

    const { badgeId } = await params;

    const badge = await db.productBadge.delete({
      where: {
        id: badgeId,
      },
    });

    revalidateTag("best-courses");
    revalidateTag("single-course");
    revalidateTag("free-courses");
    revalidateTag("single-free-course");
    revalidateTag("ebooks");
    revalidateTag("single-ebook");

    return NextResponse.json({ message: "Product badge deleted" });
  } catch (error) {
    console.log("[PRODUCT_BADGE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
