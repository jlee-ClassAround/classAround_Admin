"use server";

import { db } from "@/lib/db";
import { unstable_cache as nextCache } from "next/cache";

export async function getMainFaqs() {
  try {
    const faqs = await db.faq.findMany({
      take: 5,
      orderBy: {
        createdAt: "asc",
      },
    });

    return faqs;
  } catch {
    return [];
  }
}

export async function getCachedMainFaqs() {
  const cache = nextCache(getMainFaqs, ["main-faqs"], {
    tags: ["main-faqs"],
    revalidate: 60 * 60 * 24,
  });

  return cache();
}
