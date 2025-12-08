import { db } from "@/lib/db";

interface Props {
  productType: "COURSE" | "EBOOK";
  productId: string;
  productOptionId?: string;
  userId: string;
  couponId?: string;
  amount: number;
}

/**
 * 주문 검증
 * @param productType 상품 타입
 * @param productId 상품 ID
 * @param productOptionId 상품 옵션 ID
 * @param userId 사용자 ID
 * @param couponId 쿠폰 ID
 * @param amount 결제 금액
 * @returns 검증 결과
 */

export async function checkPaymentValidation({
  productType,
  productId,
  productOptionId,
  userId,
  couponId,
  amount,
}: Props) {
  let courseId = productId;
  let optionId = productOptionId;

  // 코스 정보가 있는지 검사
  const courseData = await db.course.findUnique({
    where: {
      id: courseId,
    },
    select: {
      productType: true,
      originalPrice: true,
      discountedPrice: true,
    },
  });
  if (!courseData)
    return {
      success: false,
      message: "Not Found Product",
    };

  // 이미 강의가 등록되었는지 검증
  const checkEnrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: userId,
        courseId: courseId,
      },
    },
    select: {
      endDate: true,
    },
  });
  if (checkEnrollment && !checkEnrollment.endDate)
    return {
      success: false,
      message: "Already Enrolled Course",
    };

  // 사용자가 쿠폰을 사용했을 때 검증 로직
  let couponData = null;
  let userCouponData = null;
  if (couponId) {
    // 쿠폰이 존재하는지 검증
    const couponResult = await db.coupon.findUnique({
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
      },
    });
    if (!couponResult)
      return {
        success: false,
        message: "존재하지 않는 쿠폰입니다.",
      };

    // 쿠폰 사용 제한 초과 검증
    if (
      couponResult.usageLimit &&
      couponResult.usedCount >= couponResult.usageLimit
    )
      return {
        success: false,
        message: "쿠폰 사용 제한 초과",
      };

    // 쿠폰 만료 검증
    if (couponResult.expiryDate < new Date())
      return {
        success: false,
        message: "만료된 쿠폰입니다.",
      };

    // 쿠폰 사용 불가능한 코스 검증 - many-to-many 관계 확인
    const couponCourseCheck = await db.coupon.findFirst({
      where: {
        id: couponId,
        courses: {
          some: {
            id: courseId,
          },
        },
      },
    });
    if (!couponCourseCheck)
      return {
        success: false,
        message: "쿠폰 사용 불가능한 코스입니다.",
      };

    // 유저에게 쿠폰이 등록되어 있는지 검증
    const userCouponResult = await db.userCoupon.findUnique({
      where: {
        userId_couponId: {
          userId: userId,
          couponId: couponResult.id,
        },
      },
    });
    if (!userCouponResult)
      return {
        success: false,
        message: "등록되지 않은 쿠폰입니다.",
      };

    couponData = couponResult;
    userCouponData = userCouponResult;
  }

  // 상품 타입에 따른 가격 계산
  let salePrice: number;
  let originalPrice: number;
  let discountedPrice: number;

  // 옵션 상품일 때 검증
  let courseOption = null;
  if (courseData.productType === "OPTION") {
    if (!optionId) {
      return {
        success: false,
        message: "Not Found.",
      };
    } else {
      const courseOptionResult = await db.courseOption.findUnique({
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
        },
      });
      if (!courseOptionResult)
        return {
          success: false,
          message: "Not Found.",
        };

      const enrolledCountAtOption = await db.enrollment.count({
        where: {
          courseOptionId: courseOptionResult.id,
          userId: userId,
        },
      });

      if (
        courseOptionResult.maxPurchaseCount &&
        enrolledCountAtOption >= courseOptionResult.maxPurchaseCount
      )
        return {
          success: false,
          message: "옵션 상품 구매 제한 초과",
        };

      courseOption = courseOptionResult;

      salePrice =
        courseOptionResult?.discountedPrice ||
        courseOptionResult?.originalPrice ||
        0;
      originalPrice = courseOptionResult?.originalPrice || 0;
      discountedPrice = courseOptionResult?.discountedPrice || 0;
    }
  } else {
    salePrice = courseData.discountedPrice
      ? courseData.discountedPrice
      : courseData.originalPrice!;
    originalPrice = courseData.originalPrice || 0;
    discountedPrice = courseData.discountedPrice || 0;
  }

  // 쿠폰 적용 최종 결제 가격 계산
  let finalPrice = salePrice;
  if (couponData) {
    if (couponData.discountType === "PERCENTAGE") {
      finalPrice = salePrice * ((100 - couponData.discountAmount) / 100);
    } else {
      finalPrice = salePrice - couponData.discountAmount;
    }
  }

  // 요청한 가격과 실제 상품 가격이 매칭되는지 검증
  if (amount !== finalPrice)
    return {
      success: false,
      message: "Error",
    };

  return {
    success: true,
    message: "검증 완료",
    data: {
      originalPrice,
      discountedPrice,
    },
  };
}
