import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { revalidateTag } from "next/cache";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ heroSliderId: string }> }
) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { heroSliderId } = await params;
    const values = await req.json();

    const heroSlider = await db.heroSlider.update({
      where: { id: heroSliderId },
      data: values,
    });

    revalidateTag("hero-slides");
    return NextResponse.json(heroSlider);
  } catch (error) {
    console.error("[PATCH /api/hero-sliders/[heroSliderId]]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ heroSliderId: string }> }
) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { heroSliderId } = await params;
    await db.heroSlider.delete({
      where: { id: heroSliderId },
    });

    revalidateTag("hero-slides");
    return NextResponse.json({ message: "삭제되었습니다." });
  } catch (error) {
    console.error("[DELETE /api/hero-sliders/[heroSliderId]]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
