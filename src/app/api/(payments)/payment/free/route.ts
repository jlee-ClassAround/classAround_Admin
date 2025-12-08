import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { calculateEndDate } from "@/utils/date-utils";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// 상품의 금액이 0원 일 경우 무료 결제 처리
export async function POST(req: Request) {
  try {
    // 로그인 했는지 검사
    const session = await getSession();
    if (!session.id) return new NextResponse("Unauthorized", { status: 401 });

    // 유저 정보 있는지 검사
    const user = await db.user.findUnique({
      where: {
        id: session.id,
      },
      select: {
        id: true,
      },
    });
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { userId, courseId, amount, couponId, optionId } = await req.json();
    if (!courseId || !userId || amount !== 0) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // 요청한 유저와 로그인한 유저가 동일한 유저인지 검증
    if (session.id !== userId)
      return new NextResponse("Unauthorized", { status: 401 });

    // 코스 정보가 있는지 검사
    const course = await db.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        id: true,
        title: true,
        originalPrice: true,
        discountedPrice: true,
        accessDuration: true,
        productType: true,
        isTaxFree: true,
      },
    });
    if (!course) return new NextResponse("Not Found Course", { status: 404 });

    // 이미 강의가 등록되었는지 검사
    const checkEnrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.id,
          courseId,
        },
      },
      select: {
        id: true,
        endDate: true,
      },
    });
    if (checkEnrollment && !checkEnrollment.endDate)
      return new NextResponse("Already Enrolled Course", { status: 409 });

    // 사용자가 쿠폰을 사용했을 때 검증 로직
    let coupon = null;
    let userCoupon = null;
    if (couponId) {
      // 쿠폰이 존재하는지 검증
      coupon = await db.coupon.findUnique({
        where: {
          id: couponId,
        },
        select: {
          id: true,
          discountType: true,
          discountAmount: true,
          usageLimit: true,
          usedCount: true,
          expiryDate: true,
          courses: {
            select: {
              id: true,
            },
          },
        },
      });
      if (!coupon)
        return new NextResponse("존재하지 않는 쿠폰입니다.", { status: 404 });
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
        return new NextResponse("쿠폰 사용 제한 초과", { status: 403 });
      if (coupon.expiryDate < new Date())
        return new NextResponse("만료된 쿠폰입니다.", { status: 403 });
      if (!coupon.courses.some((course) => course.id === courseId))
        return new NextResponse("쿠폰 사용 불가능한 코스입니다.", {
          status: 403,
        });

      // 유저에게 쿠폰이 등록되어 있는지 검증
      userCoupon = await db.userCoupon.findUnique({
        where: {
          userId_couponId: {
            userId: session.id,
            couponId: coupon.id,
          },
        },
        select: {
          id: true,
        },
      });
      if (!userCoupon)
        return new NextResponse("등록되지 않은 쿠폰입니다.", { status: 403 });
    }

    // 상품 타입에 따른 가격 계산
    let salePrice;

    // 옵션 상품일 때 검증
    let courseOption = null;
    if (course.productType === "OPTION") {
      if (!optionId) {
        return new NextResponse("Not Found.", { status: 404 });
      } else {
        courseOption = await db.courseOption.findUnique({
          where: {
            id: optionId,
          },
          select: {
            originalPrice: true,
            discountedPrice: true,
            isTaxFree: true,
          },
        });
        salePrice =
          courseOption?.discountedPrice || courseOption?.originalPrice || 0;
      }
    } else {
      salePrice = course.discountedPrice
        ? course.discountedPrice
        : course.originalPrice!;
    }

    // 최종 결제 가격
    let finalPrice = salePrice;
    if (coupon) {
      finalPrice =
        coupon.discountType === "percentage"
          ? salePrice * ((100 - coupon.discountAmount) / 100)
          : salePrice - coupon.discountAmount;
    }

    if (finalPrice < 0) {
      finalPrice = 0;
    }

    // 요청한 가격과 실제 상품 가격이 매칭되는지 검증
    if (Number(amount) !== finalPrice)
      return new NextResponse("Amount Error", { status: 400 });

    await db.$transaction(async (tx) => {
      await tx.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId,
          },
        },
        update: {
          courseOptionId: optionId || null,
          startDate: new Date(),
          endDate: course.accessDuration
            ? calculateEndDate(
                checkEnrollment?.endDate || null,
                course.accessDuration
              )
            : null,
          isActive: true,
          enrollCount: {
            increment: 1,
          },
        },
        create: {
          userId: user.id,
          courseId: course.id,
          courseOptionId: optionId || null,
          endDate: course.accessDuration
            ? calculateEndDate(
                checkEnrollment?.endDate || null,
                course.accessDuration
              )
            : null,
        },
        select: {
          id: true,
        },
      });

      await tx.tossCustomer.create({
        data: {
          userId: user.id,
          paymentKey: `FREE-${uuidv4()}`, // 무료 결제 구분을 위한 접두사
          orderId: `FREE-${uuidv4()}`,
          orderName: course.title,

          ...(courseOption
            ? {
                originalPrice: courseOption.originalPrice,
                discountPrice: courseOption.discountedPrice,
                isTaxFree: courseOption.isTaxFree,
              }
            : {
                originalPrice: course.originalPrice || 0,
                discountPrice: course.discountedPrice,
                isTaxFree: course.isTaxFree,
              }),

          couponType: coupon ? coupon.discountType : null,
          couponAmount: coupon ? coupon.discountAmount : null,
          finalPrice,

          productType: "COURSE",
          productId: course.id,
          productTitle: course.title,
          productOptionId: optionId,
          productOption: courseOption || {},

          paymentStatus: "COMPLETED",
          courseId: course.id,
        },
      });

      if (coupon) {
        await tx.userCoupon.update({
          where: {
            userId_couponId: {
              userId: user.id,
              couponId: coupon.id,
            },
          },
          data: {
            isUsed: true,
            usedAt: new Date(),
          },
        });

        await tx.coupon.update({
          where: {
            id: coupon.id,
          },
          data: {
            usedCount: coupon.usedCount + 1,
          },
        });
      }
    });

    return new NextResponse("Payment Success", { status: 200 });
  } catch (e) {
    console.log("[PAYMENT_FREE_ERROR]", e);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
