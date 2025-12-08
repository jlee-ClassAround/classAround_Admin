"use server";

import { db } from "@/lib/db";
import { unstable_cache as nextCache } from "next/cache";

export async function getTermsOfUse() {
  const termsOfUse = await db.terms.findUnique({
    where: { id: 2 },
  });
  return termsOfUse;
}

export async function getCachedTermsOfUse() {
  const cache = nextCache(getTermsOfUse, ["terms-of-use"], {
    tags: ["terms-of-use"],
    revalidate: 60 * 60 * 24,
  });

  return cache();
}
