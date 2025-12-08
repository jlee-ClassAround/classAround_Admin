import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { CouponSchema } from "@/validations/schemas";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const values: CouponSchema = await req.json();

    const coupon = await db.coupon.create({
      data: {
        ...values,
        courses: {
          connect: values.courses?.map((course) => ({ id: course.id })),
        },
      },
    });

    return NextResponse.json(coupon);
  } catch (e) {
    console.log("[COUPON_POST_ERROR", e);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { couponIds } = await req.json();

    await db.coupon.deleteMany({
      where: {
        id: {
          in: couponIds,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.log("[COUPONS_DELETE_ERROR", e);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
