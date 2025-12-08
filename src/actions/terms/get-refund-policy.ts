"use server";

import { db } from "@/lib/db";
import { unstable_cache as nextCache } from "next/cache";

export async function getRefundPolicy() {
  const refundPolicy = await db.terms.findUnique({
    where: { id: 3 },
  });
  return refundPolicy;
}

export async function getCachedRefundPolicy() {
  const cache = nextCache(getRefundPolicy, ["refund-policy"], {
    tags: ["refund-policy"],
    revalidate: 60 * 60 * 24,
  });

  return cache();
}
