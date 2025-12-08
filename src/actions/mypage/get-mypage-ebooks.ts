"use server";

import { db } from "@/lib/db";

interface Props {
  userId?: string;
}

export async function getMypageEbooks({ userId }: Props) {
  try {
    if (!userId) return [];

    const ebookPurchases = await db.ebookPurchase.findMany({
      where: {
        userId,
        ebook: {
          isPublished: true,
        },
      },
      include: {
        ebook: true,
      },
    });

    const ebooks = ebookPurchases.map((ebook) => ebook.ebook);

    return ebooks;
  } catch (error) {
    console.error(error);
    return [];
  }
}
