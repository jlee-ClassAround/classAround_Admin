"use server";

import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { AdminRevenueSchema } from "@/validations/schemas";

interface Props {
  revenueId?: number;
  values: AdminRevenueSchema;
}

export async function upsertRevenue({ revenueId, values }: Props) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return { error: "권한이 없습니다." };

  const revenue = await db.revenue.upsert({
    where: { id: revenueId ?? 0 },
    update: {
      ...values,
    },
    create: {
      ...values,
    },
  });

  return { revenue };
}
