import { UserBillingInfo } from "@prisma/client";
import { db } from "@/lib/db";

interface Props {
  userId: string;
}

export type GetUserBillingInfo = UserBillingInfo | null;

export async function getUserBillingInfo({
  userId,
}: Props): Promise<GetUserBillingInfo> {
  const billingInfo = await db.userBillingInfo.findUnique({
    where: {
      userId,
    },
  });

  return billingInfo;
}
