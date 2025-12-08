"use server";

import { db } from "@/lib/db";
import { unstable_cache as nextCache } from "next/cache";

export async function getSingleEbook(ebookId: string) {
  const ebook = await db.ebook.findUnique({
    where: {
      id: ebookId,
    },
    include: {
      detailImages: true,
      productBadge: true,
    },
  });
  return ebook;
}

export async function getCachedSingleEbook(ebookId: string) {
  const cache = nextCache(getSingleEbook, [`ebook-${ebookId}`], {
    tags: [`ebook-${ebookId}`, "single-ebook"],
    revalidate: 60 * 60 * 24,
  });

  return cache(ebookId);
}
