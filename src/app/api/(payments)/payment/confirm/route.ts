import { sendAlimtalk } from "@/actions/alimtalk/send-alimtalk";
import { postTracking } from "@/actions/tracking/post-tracking";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { TossPayment } from "@/external-api/tosspayments/types/tosspayment-object";
import { calculateEndDate } from "@/utils/date-utils";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// 시크릿 키 인코딩
const encryptedSecretKey =
  "Basic " + Buffer.from(process.env.TOSS_SECRET_KEY! + ":").toString("base64");

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
        phone: true,
        username: true,
        nickname: true,
      },
    });
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { orderId, paymentKey, amount } = await req.json();
    if (!orderId || !paymentKey || !amount) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const cookieStore = await cookies();
    const trkId = cookieStore.get("trkId")?.value;

    // 요청한 페이먼트 정보 조회
    const paymentResponse = await fetch(
      `https://api.tosspayments.com/v1/payments/${paymentKey}`,
      {
        method: "GET",
        headers: { Authorization: encryptedSecretKey },
      }
    );

    // 메타데이타 검증
    const {
      metadata: { couponId, userId, courseId, optionId },
    }: {
      metadata: {
        couponId: string | null;
        userId: string | null;
        courseId: string | null;
        optionId?: string;
      };
    } = await paymentResponse.json();
    if (!userId || !courseId)
      return new NextResponse("Missing metadata", { status: 404 });

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
        productType: true,
        originalPrice: true,
        discountedPrice: true,
        accessDuration: true,
        isTaxFree: true,
        kakaoRoomLink: true,
        kakaoRoomPassword: true,
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
            id: true,
            name: true,
            originalPrice: true,
            discountedPrice: true,
            isTaxFree: true,
            maxPurchaseCount: true,
            _count: {
              select: {
                enrollments: true,
              },
            },
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

    // 쿠폰 적용 최종 결제 가격 계산
    let finalPrice = salePrice;
    if (coupon) {
      if (coupon.discountType === "percentage") {
        finalPrice = salePrice * ((100 - coupon.discountAmount) / 100);
      } else {
        finalPrice = salePrice - coupon.discountAmount;
      }
    }

    // 요청한 가격과 실제 상품 가격이 매칭되는지 검증
    if (Number(amount) !== finalPrice)
      return new NextResponse("Amount Error", { status: 400 });

    // 토스페이먼츠 최종 승인 요청
    const response = await fetch(
      "https://api.tosspayments.com/v1/payments/confirm",
      {
        method: "POST",
        body: JSON.stringify({
          orderId,
          amount,
          paymentKey,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: encryptedSecretKey,
          "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
        },
      }
    );
    const json: TossPayment = await response.json();
    // console.log("[PAYMENT_CONFIRM_JSON]", json);

    // 승인 완료 후 처리 로직
    if (json.status === "DONE") {
      const result = await db.$transaction(async (tx) => {
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

        const tossCustomer = await tx.tossCustomer.create({
          data: {
            userId: user.id,
            paymentKey: json.paymentKey,
            orderId: json.orderId,
            orderName: json.orderName,

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
            receiptUrl: json.receipt?.url,

            productType: "COURSE",
            productId: course.id,
            productTitle: course.title,
            productOptionId: optionId,
            productOption: courseOption || undefined,
            paymentStatus: "COMPLETED",
            courseId,
          },
          select: {
            orderId: true,
            paymentKey: true,
          },
        });

        let updatedCoupon = null;
        if (coupon) {
          updatedCoupon = await tx.userCoupon.update({
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

        return {
          tossCustomer,
          ...(updatedCoupon ? { updatedCoupon } : {}),
        };
      });

      // 결제 완료 알림톡
      await sendAlimtalk({
        sendType: "payment-confirm",
        phone: user.phone || "",
        username: user.username || "고객",
        courseName: json.orderName,
        roomLink: "https://www.cojooboo.co.kr/mypage/studyroom",
        roomCode: "없음",
      });

      // 트래킹 전송
      if (trkId) {
        await postTracking({
          userId: user.id,
          parameterName: trkId,
          username: user.username || "",
          nickname: user.nickname || "",
          phone: user.phone || "",
        });
      }

      revalidateTag(`course-${courseId}`);

      return NextResponse.json({
        orderId: result.tossCustomer.orderId,
        paymentKey: result.tossCustomer.paymentKey,
        courseId: course.id,
        finalPrice,
      });
    }

    return new NextResponse("Payment Failed", { status: 400 });
  } catch (e) {
    console.log("[PAYMENT_CONFIRM_ERROR]", e);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
