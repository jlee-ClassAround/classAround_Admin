import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) return new NextResponse("Unauthorized", { status: 401 });

    const values = await req.json();

    await db.productBadge.create({
      data: {
        ...values,
      },
    });

    return NextResponse.json({ message: "Product badge created" });
  } catch (error) {
    console.log("[PRODUCT_BADGES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) return new NextResponse("Unauthorized", { status: 401 });

    const { ids } = await req.json();

    await db.productBadge.deleteMany({
      where: { id: { in: ids } },
    });

    revalidateTag("best-courses");
    revalidateTag("single-course");
    revalidateTag("free-courses");
    revalidateTag("single-free-course");
    revalidateTag("ebooks");
    revalidateTag("single-ebook");

    return NextResponse.json({ message: "Product badges deleted" });
  } catch (error) {
    console.log("[PRODUCT_BADGES_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
