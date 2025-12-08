"use server";

import { db } from "@/lib/db";
import { isEndDateOver } from "@/utils/date-utils";

export async function getIsEnrollment(courseId: string, userId?: string) {
  try {
    if (!userId) return false;

    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      select: {
        id: true,
        endDate: true,
        isActive: true,
      },
    });
    if (!enrollment) return false;

    if (enrollment.endDate && isEndDateOver(enrollment.endDate)) {
      if (enrollment.isActive) {
        await db.enrollment.update({
          where: {
            userId_courseId: {
              userId,
              courseId,
            },
          },
          data: {
            isActive: false,
          },
        });
      }
      return false;
    }

    return true;
  } catch (e) {
    console.log("[GET_USER_ENROLLMENT]", e);
    return false;
  }
}
