"use server";

import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { EnrollFormSchema } from "./schemas";

export async function enrollUserInCourse(values: EnrollFormSchema) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) {
      return {
        success: false,
        message: "권한이 없습니다.",
      };
    }

    const { courseId, userIds, endDate } = values;

    const existingEnrollments = await db.enrollment.findMany({
      where: {
        userId: {
          in: userIds.map((user) => user.id),
        },
        courseId,
      },
    });

    if (existingEnrollments.length > 0) {
      return {
        success: false,
        message: "해당 강의에 이미 등록된 수강생이 있습니다.",
        data: existingEnrollments.map((enrollment) => enrollment.userId),
      };
    }

    await db.enrollment.createMany({
      data: userIds.map((user) => ({
        userId: user.id,
        courseId,
        endDate,
      })),
    });

    return {
      success: true,
      message: "강의 등록에 성공했습니다.",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "오류가 발생했습니다.",
    };
  }
}

export async function deleteEnrollment(enrollmentId: string) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    throw new Error("관리자만 등록을 삭제할 수 있습니다.");
  }

  await db.enrollment.delete({
    where: {
      id: enrollmentId,
    },
  });

  return {
    success: true,
  };
}

export async function deleteEnrollments(ids: string[]) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    throw new Error("관리자만 등록을 삭제할 수 있습니다.");
  }

  await db.enrollment.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  return {
    success: true,
  };
}
