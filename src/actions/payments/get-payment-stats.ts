"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { DateRange } from "react-day-picker";

export async function getPaymentStats({
  dateRange,
  status,
  type,
  courseId,
  search,
}: {
  dateRange?: DateRange;
  status?: string;
  type?: string;
  courseId?: string;
  search?: string;
} = {}) {
  let whereClause: Prisma.TossCustomerWhereInput = {};

  if (dateRange?.from) {
    whereClause.createdAt = {
      gte: dateRange.from,
      lte: dateRange.to
        ? new Date(dateRange.to.setHours(23, 59, 59))
        : undefined,
    };
  }

  if (status && status !== "ALL") {
    whereClause.paymentStatus = status;
  }

  if (type && type !== "ALL") {
    whereClause.productType = type;
  }

  if (courseId && type === "COURSE") {
    whereClause.courseId = courseId;
  }

  if (search) {
    whereClause.OR = [
      {
        user: {
          OR: [
            { username: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
          ],
        },
      },
      {
        course: {
          title: { contains: search },
        },
      },
    ];
  }

  try {
    // 전체 결제 통계 (환불 금액 제외)
    const totalStats = await db.tossCustomer.aggregate({
      where: whereClause,
      _sum: {
        finalPrice: true,
        cancelAmount: true,
      },
      _count: {
        id: true,
      },
    });

    // 결제 유형별 통계 - 환불 금액 제외
    const typeStats = await db.tossCustomer.groupBy({
      where: whereClause,
      by: ["productType"],
      _sum: {
        finalPrice: true,
        cancelAmount: true,
      },
      _count: {
        id: true,
      },
    });

    // 쿠폰 사용 통계
    const couponStats = await db.tossCustomer.aggregate({
      where: {
        AND: [
          whereClause,
          {
            NOT: {
              couponType: null,
            },
          },
        ],
      },
      _count: {
        id: true,
      },
      _sum: {
        couponAmount: true,
      },
    });

    // 환불 금액을 제외한 실제 매출 계산
    const totalRevenue =
      (totalStats._sum.finalPrice || 0) - (totalStats._sum.cancelAmount || 0);
    const courseRevenue =
      typeStats.find((t) => t.productType === "COURSE")?._sum.finalPrice || 0;
    const courseCancelAmount =
      typeStats.find((t) => t.productType === "COURSE")?._sum.cancelAmount || 0;
    const ebookRevenue =
      typeStats.find((t) => t.productType === "EBOOK")?._sum.finalPrice || 0;
    const ebookCancelAmount =
      typeStats.find((t) => t.productType === "EBOOK")?._sum.cancelAmount || 0;

    return {
      totalRevenue,
      totalOrders: totalStats._count.id || 0,
      courseRevenue: courseRevenue - courseCancelAmount,
      ebookRevenue: ebookRevenue - ebookCancelAmount,
      couponUsageCount: couponStats._count.id || 0,
      totalDiscountAmount: couponStats._sum.couponAmount || 0,
      totalRefundAmount: totalStats._sum.cancelAmount || 0,
    };
  } catch (error) {
    console.error("[GET_PAYMENT_STATS_ERROR]", error);
    throw new Error("결제 통계를 불러오는데 실패했습니다.");
  }
}
