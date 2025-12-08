import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { EbookSchema } from "@/validations/schemas";
import { DetailImageType } from "@/store/use-detail-images";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: Request) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin)
      return NextResponse.json({ error: "Unauthorized", status: 401 });

    const {
      values,
      images,
    }: { values: EbookSchema; images: DetailImageType[] } = await req.json();

    const ebook = await db.ebook.create({
      data: {
        ...values,
        detailImages: {
          create: images.map((image, index) => ({
            name: image.name,
            imageUrl: image.imageUrl,
            position: index + 1,
          })),
        },
      },
    });

    revalidateTag("feature-ebooks");
    revalidateTag("ebooks");

    return NextResponse.json(ebook);
  } catch (e) {
    console.log(e);
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
      return NextResponse.json({ error: "Unauthorized", status: 401 });

    const { ids } = await req.json();
    await db.ebook.deleteMany({
      where: { id: { in: ids } },
    });

    revalidateTag("feature-ebooks");
    revalidateTag("ebooks");

    return NextResponse.json({ message: "Ebooks deleted successfully" });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
