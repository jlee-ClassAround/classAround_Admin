import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session.id) return new NextResponse("Guest User", { status: 401 });

    const { code } = await req.json();

    // 쿠폰 코드 데이터 검증
    if (!code || typeof code !== "string") {
      return new NextResponse("잘못된 코드입니다.", { status: 400 });
    }

    // 쿠폰이 있는지 검사
    const coupon = await db.coupon.findUnique({
      where: {
        code,
      },
    });
    if (!coupon) return new NextResponse("잘못된 코드입니다", { status: 404 });

    // 쿠폰의 만료일이 지났는지 검사
    if (coupon.expiryDate < new Date())
      return new NextResponse("만료된 쿠폰입니다", { status: 400 });

    // 쿠폰의 사용가능 개수가 초과했는지 검사

    // 이미 등록 되어있는지 검사
    const isEnrolled = await db.userCoupon.findUnique({
      where: {
        userId_couponId: {
          userId: session.id,
          couponId: coupon.id,
        },
      },
    });
    if (isEnrolled)
      return new NextResponse("이미 등록된 쿠폰입니다", { status: 409 });

    // 쿠폰 등록
    const userCoupon = await db.userCoupon.create({
      data: {
        userId: session.id,
        couponId: coupon.id,
      },
    });

    return NextResponse.json(userCoupon);
  } catch (e) {
    console.log("[COUPON_ENROLL_ERROR]", e);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
