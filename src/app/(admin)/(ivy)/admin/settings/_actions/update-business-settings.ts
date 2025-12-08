"use server";

import { BusinessFormSchema } from "../business/_components/business-form";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { db } from "@/lib/db";
import { revalidateTag } from "next/cache";

export const updateBusinessSettings = async (values: BusinessFormSchema) => {
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

  return {
    success: true,
  };
};
