"use server";

import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { SiteSettingSchema } from "@/validations/schemas";
import { revalidateTag } from "next/cache";

export const updateBasicSettings = async (values: SiteSettingSchema) => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  await db.siteSetting.upsert({
    where: {
      id: 1,
    },
    update: {
      ...values,
    },
    create: {
      id: 1,
      ...values,
    },
  });

  revalidateTag("site-setting");

  return true;
};
