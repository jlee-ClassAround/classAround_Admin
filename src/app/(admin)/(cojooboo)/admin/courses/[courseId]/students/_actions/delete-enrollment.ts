"use server";

import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";

export async function deleteEnrollment(enrollmentId: string) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) {
      return {
        success: false,
        message: "관리자만 등록을 삭제할 수 있습니다.",
      };
    }

    await db.enrollment.delete({
      where: {
        id: enrollmentId,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.log("[DELETE_ENROLLMENT_ERROR]", error);
    return {
      success: false,
      message: "등록 삭제 중 오류가 발생했습니다.",
    };
  }
}
