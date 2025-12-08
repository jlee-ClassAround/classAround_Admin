import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { EbookSchema } from "@/validations/schemas";
import { DetailImageType } from "@/store/use-detail-images";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

interface Props {
  params: Promise<{ ebookId: string }>;
}

export async function PATCH(req: Request, { params }: Props) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin)
      return NextResponse.json({ error: "Unauthorized", status: 401 });

    const { ebookId } = await params;

    const {
      values,
      images,
    }: { values: EbookSchema; images: DetailImageType[] } = await req.json();

    const { productBadgeIds, ...data } = values;

    await db.ebook.update({
      where: { id: ebookId },
      data: {
        ...data,
        detailImages: {
          deleteMany: {},
          create: images.map((image, index: number) => ({
            name: image.name,
            imageUrl: image.imageUrl,
            position: index + 1,
          })),
        },
        productBadge: {
          set: productBadgeIds?.map((id) => ({
            id,
          })),
        },
      },
    });

    revalidateTag("feature-ebooks");
    revalidateTag("ebooks");
    revalidateTag(`ebook-${ebookId}`);

    return NextResponse.json({ message: "Ebook updated successfully" });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: Props) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin)
      return NextResponse.json({ error: "Unauthorized", status: 401 });

    const { ebookId } = await params;

    await db.ebook.delete({
      where: { id: ebookId },
    });

    revalidateTag("feature-ebooks");
    revalidateTag("ebooks");
    revalidateTag(`ebook-${ebookId}`);

    return NextResponse.json({ message: "Ebook deleted successfully" });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
