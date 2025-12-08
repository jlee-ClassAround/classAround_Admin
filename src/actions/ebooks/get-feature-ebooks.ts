"use server";

import { db } from "@/lib/db";
import { unstable_cache as nextCache } from "next/cache";

export async function getFeatureEbooks() {
  try {
    const ebooks = await db.ebook.findMany({
      where: {
        isPublished: true,
      },
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
    });

    return ebooks;
  } catch {
    return [];
  }
}

export async function getCachedFeatureEbooks() {
  const cache = nextCache(getFeatureEbooks, ["feature-ebooks"], {
    tags: ["feature-ebooks"],
    revalidate: 60 * 60 * 24,
  });

  return cache();
}
