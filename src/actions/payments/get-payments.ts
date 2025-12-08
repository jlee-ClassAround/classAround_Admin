"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { DateRange } from "react-day-picker";

export async function getPayments({
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
  try {
    let whereClause: Prisma.TossCustomerWhereInput = {};

    // 날짜 필터 적용
    if (dateRange?.from) {
      whereClause.createdAt = {
        gte: dateRange.from,
        lte: dateRange.to
          ? new Date(dateRange.to.setHours(23, 59, 59))
          : undefined,
      };
    }

    // 상태 필터 적용
    if (status && status !== "ALL") {
      whereClause.paymentStatus = status;
    }

    // 상품 유형 필터 적용
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
        {
          orderId: { contains: search },
        },
        {
          orderName: { contains: search },
        },
      ];
    }

    const payments = await db.tossCustomer.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            username: true,
            email: true,
            phone: true,
          },
        },
        course: {
          select: {
            title: true,
          },
        },
        ebook: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return payments;
  } catch (error) {
    console.error("[GET_PAYMENTS_ERROR]", error);
    throw new Error("결제 내역을 불러오는데 실패했습니다.");
  }
}
