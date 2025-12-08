import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { CouponSchema } from "@/validations/schemas";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ couponId: string }> }
) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { couponId } = await params;
    const values: CouponSchema = await req.json();

    const coupon = await db.coupon.update({
      where: {
        id: couponId,
      },
      data: {
        ...values,
        courses: {
          set: values.courses?.map((course) => ({ id: course.id })),
        },
      },
    });

    return NextResponse.json(coupon);
  } catch (e) {
    console.log("[COUPON_ID_PUT_ERROR]", e);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ couponId: string }> }
) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { couponId } = await params;

    await db.coupon.delete({
      where: {
        id: couponId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.log("[COUPON_ID_DELETE_ERROR]", e);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
