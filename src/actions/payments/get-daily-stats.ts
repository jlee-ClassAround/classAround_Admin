"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { addDays, format } from "date-fns";
import { ko } from "date-fns/locale";
import { DateRange } from "react-day-picker";

export async function getDailyStats({
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
  if (!dateRange?.from || !dateRange?.to) return [];

  try {
    let whereClause: Prisma.TossCustomerWhereInput = {
      createdAt: {
        gte: dateRange.from,
        lte: new Date(dateRange.to.setHours(23, 59, 59)),
      },
    };

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

    const dailyStats = await db.tossCustomer.groupBy({
      by: ["createdAt"],
      where: whereClause,
      _sum: {
        finalPrice: true,
      },
      _count: {
        id: true,
      },
    });

    // 날짜별로 데이터 정리
    const stats = new Map();
    let currentDate = dateRange.from;

    while (currentDate <= dateRange.to) {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      stats.set(dateStr, {
        date: format(currentDate, "M/d", { locale: ko }),
        revenue: 0,
        orders: 0,
      });
      currentDate = addDays(currentDate, 1);
    }

    // 실제 데이터 매핑
    dailyStats.forEach((stat) => {
      const dateStr = format(stat.createdAt, "yyyy-MM-dd");
      if (stats.has(dateStr)) {
        stats.get(dateStr).revenue = stat._sum.finalPrice || 0;
        stats.get(dateStr).orders = stat._count.id || 0;
      }
    });

    return Array.from(stats.values());
  } catch (error) {
    console.error("[GET_DAILY_STATS_ERROR]", error);
    throw new Error("일별 통계를 불러오는데 실패했습니다.");
  }
}
