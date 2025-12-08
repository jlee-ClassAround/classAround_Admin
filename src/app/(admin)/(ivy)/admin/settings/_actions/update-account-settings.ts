"use server";

import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { getBankNameByCode } from "@/utils/payments/get-bank-info";
import { revalidateTag } from "next/cache";
import { AccountFormSchema } from "../account/_components/account-form";

export const updateAccountSettings = async (values: AccountFormSchema) => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  // 은행 코드로부터 은행명 찾기
  const bankName = getBankNameByCode(values.bankCode);

  await db.siteSetting.upsert({
    where: {
      id: 1,
    },
    update: {
      ...values,
      bankName: bankName,
    },
    create: {
      id: 1,
      ...values,
      bankName: bankName,
    },
  });

  revalidateTag("site-setting");

  return {
    success: true,
  };
};
