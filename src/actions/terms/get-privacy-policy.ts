"use server";

import { db } from "@/lib/db";
import { unstable_cache as nextCache } from "next/cache";

export async function getPrivacyPolicy() {
  const privacyPolicy = await db.terms.findUnique({
    where: { id: 1 },
  });
  return privacyPolicy;
}

export async function getCachedPrivacyPolicy() {
  const cache = nextCache(getPrivacyPolicy, ["privacy-policy"], {
    tags: ["privacy-policy"],
    revalidate: 60 * 60 * 24,
  });

  return cache();
}
