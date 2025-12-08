"use server";

import { db } from "@/lib/db";

interface Props {
  userId?: string;
  courseId?: string;
}

/**
 * 사용자의 분할결제 진행 상태를 확인합니다.
 *
 * @param params - 함수 매개변수 객체
 * @param params.userId - 사용자 ID (선택사항)
 * @param params.courseId - 강의 ID (선택사항, 특정 강의만 확인할 때 사용)
 *
 * @returns 분할결제 진행 중이면 orderId가 담긴 객체, 그렇지 않으면 `false`
 */
export async function getIsPartialPayments({ userId, courseId }: Props) {
  if (!userId) return false;

  const order = await db.order.findFirst({
    where: {
      userId: userId,
      status: "IN_PARTIAL_PROGRESS",
      ...(courseId
        ? {
            orderItems: {
              some: {
                courseId: courseId,
              },
            },
          }
        : {}),
    },
    select: {
      id: true,
    },
  });

  return order || false;
}
