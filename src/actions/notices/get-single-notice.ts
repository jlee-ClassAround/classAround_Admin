"use server";

import { db } from "@/lib/db";
import { unstable_cache as nextCache } from "next/cache";

export async function getSingleNotice(noticeId: number) {
  const notice = await db.notice.findUnique({
    where: {
      id: noticeId,
    },
  });
  return notice;
}

export async function getCachedSingleNotice(noticeId: number) {
  const cache = nextCache(getSingleNotice, [`notice-${noticeId}`], {
    tags: [`notice-${noticeId}`],
    revalidate: 60 * 60 * 24,
  });

  return cache(noticeId);
}
