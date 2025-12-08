"use server";

import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { AdminReviewSchema } from "@/validations/schemas";

interface Props {
  reviewId?: number;
  values: AdminReviewSchema;
}

export async function upsertReview({ reviewId, values }: Props) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return { error: "권한이 없습니다." };

  const review = await db.review.upsert({
    where: { id: reviewId ?? 0 },
    update: {
      ...values,
    },
    create: {
      ...values,
    },
  });

  return { review };
}
