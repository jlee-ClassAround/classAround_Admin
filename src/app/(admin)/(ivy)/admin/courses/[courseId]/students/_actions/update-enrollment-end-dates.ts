"use server";

import { db } from "@/lib/db";

interface Props {
  courseId: string;
  endDate: Date | null;
}

export async function updateEnrollmentEndDates({ courseId, endDate }: Props) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 무제한이거나 오늘보다 미래면 true, 과거면 false
    let isActive = true;
    if (endDate !== null) {
      const endDateOnly = new Date(endDate);
      endDateOnly.setHours(0, 0, 0, 0);
      isActive = endDateOnly >= today;
    }

    const result = await db.enrollment.updateMany({
      where: {
        courseId,
      },
      data: {
        endDate,
        isActive,
      },
    });

    return { success: true, updatedCount: result.count };
  } catch (error) {
    console.error("[UPDATE_ENROLLMENT_END_DATES_ERROR]", error);
    return { success: false, error: "만료일자 수정 중 오류가 발생했습니다." };
  }
}
