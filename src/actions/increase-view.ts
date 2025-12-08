"use server";

import { db } from "@/lib/db";

type ViewableModel = "notice" | "event" | "review" | "revenue" | "post";

export async function increaseView(id: string, model: ViewableModel) {
  try {
    if (model === "notice") {
      await db.notice.update({
        where: { id: Number(id) },
        data: { view: { increment: 1 } },
      });
      return true;
    }
    if (model === "event") {
      await db.event.update({
        where: { id: Number(id) },
        data: { view: { increment: 1 } },
      });
      return true;
    }
    if (model === "review") {
      await db.review.update({
        where: { id: Number(id) },
        data: { view: { increment: 1 } },
      });
      return true;
    }
    if (model === "revenue") {
      await db.revenue.update({
        where: { id: Number(id) },
        data: { view: { increment: 1 } },
      });
      return true;
    }
    if (model === "post") {
      await db.post.update({
        where: { id: Number(id) },
        data: { view: { increment: 1 } },
      });
      return true;
    }

    return true;
  } catch (error) {
    console.error("increaseView error", error);
    return null;
  }
}
