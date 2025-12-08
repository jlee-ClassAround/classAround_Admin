import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { revalidateTag } from "next/cache";

export async function POST(req: Request) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const values = await req.json();

    const heroSlider = await db.heroSlider.create({
      data: values,
    });

    revalidateTag("hero-slides");

    return NextResponse.json(heroSlider);
  } catch (error) {
    console.error("[POST /api/hero-sliders]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { ids } = await req.json();

    await db.heroSlider.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    revalidateTag("hero-slides");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/hero-sliders]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
