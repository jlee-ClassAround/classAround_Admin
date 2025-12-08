import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { revalidateTag } from "next/cache";

export async function POST(
  _: Request,
  { params }: { params: Promise<{ [key: string]: string }> }
) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { ebookId } = await params;

    const ebook = await db.ebook.findUnique({
      where: { id: ebookId },
    });
    if (!ebook) {
      return new NextResponse("Ebook not found", { status: 404 });
    }

    await db.ebook.create({
      data: {
        ...ebook,
        id: uuidv4(),
        title: ebook.title + "-복제됨",
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    revalidateTag("feature-ebooks");
    revalidateTag("ebooks");

    return NextResponse.json({ message: "Ebook duplicated" });
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
