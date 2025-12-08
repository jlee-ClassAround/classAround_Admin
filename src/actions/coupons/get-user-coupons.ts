"use server";

import { db } from "@/lib/db";

export async function getUserCoupons(userId: string, courseId?: string) {
  try {
    const userConpons = await db.userCoupon.findMany({
      where: {
        userId,
        isUsed: false,
        ...(courseId && {
          coupon: {
            courses: {
              some: { id: courseId },
            },
          },
        }),
      },
      include: {
        coupon: true,
      },
    });

    const coupons = userConpons
      .map((item) => item.coupon)
      .filter((coupon) => coupon.expiryDate > new Date());

    return coupons;
  } catch {
    return [];
  }
}
