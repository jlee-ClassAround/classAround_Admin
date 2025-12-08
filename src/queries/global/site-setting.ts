import { db } from "@/lib/db";
import { unstable_cache as nextCache } from "next/cache";

export async function getSiteSetting() {
  return await db.siteSetting.findUnique({
    where: {
      id: 1,
    },
  });
}

export async function getCachedSiteSetting() {
  const cache = nextCache(getSiteSetting, ["site-setting"], {
    tags: ["site-setting"],
  });

  return cache();
}
