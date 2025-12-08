import { db } from "@/lib/db";
import { TossPaymentWebhookBody } from "@/external-api/tosspayments/types/webhook-response";
import { calculateEndDate } from "@/utils/date-utils";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body: TossPaymentWebhookBody = await request.json();
    console.log("[toss webhook] body", body);

    const existingPayment = await db.payment.findUnique({
      where: {
        id: body.orderId,
      },
      select: {
        id: true,
        paymentStatus: true,
        tossSecretKey: true,
        amount: true,
        paymentMethod: true,
        order: {
          select: {
            id: true,
            userId: true,

            remainingAmount: true,
            paidAmount: true,
            orderItems: {
              select: {
                productId: true,
                productTitle: true,
                productCategory: true,
                productOptionId: true,
              },
            },
          },
        },
      },
    });
    // 주문 정보 조회
    if (!existingPayment) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }
    // 시크릿 키 검증
    if (!body?.secret || body.secret !== existingPayment.tossSecretKey) {
      console.error("[toss webhook] Error", body);
      return NextResponse.json(
        { success: false, message: "not found" },
        { status: 404 }
      );
    }

    // 중복 처리 방지 - 이미 처리된 결제인지 확인
    if (existingPayment.paymentStatus === "DONE") {
      console.log("[toss webhook] Already processed", body.orderId);
      return NextResponse.json(
        { success: true, message: "Already processed" },
        { status: 200 }
      );
    }

    if (body.status === "DONE") {
      await db.$transaction(async (tx) => {
        // 유저 정보 조회
        if (!existingPayment.order.userId) {
          return NextResponse.json(
            { success: false, message: "User not found" },
            { status: 404 }
          );
        }
        // 코스 정보 조회
        const courseData = await tx.course.findUnique({
          where: {
            id: existingPayment.order.orderItems[0].productId,
          },
          select: {
            id: true,
            accessDuration: true,
          },
        });

        if (!courseData) {
          return NextResponse.json(
            { success: false, message: "Course not found" },
            { status: 404 }
          );
        }

        // 남은 결제 금액 업데이트
        const remainingAmount =
          existingPayment.order.remainingAmount - existingPayment.amount;
        const isCompleted = remainingAmount === 0;

        // 주문 상태 업데이트
        await tx.order.update({
          where: {
            id: existingPayment.order.id,
          },
          data: {
            remainingAmount,
            ...(isCompleted && { status: "PAID" }),
            paidAmount:
              existingPayment.order.paidAmount + existingPayment.amount,
          },
        });

        await tx.payment.update({
          where: {
            id: existingPayment.id,
          },
          data: {
            paymentStatus: "DONE",
          },
        });

        // 거래 내역 생성
        await tx.transaction.create({
          data: {
            orderId: existingPayment.order.id,
            paymentId: existingPayment.id,
            method: existingPayment.paymentMethod,
            status: "DONE",
            customerKey: existingPayment.order.userId,
            amount: existingPayment.amount,
          },
        });

        // 모든 결제 완료 여부 확인
        if (isCompleted) {
          // 토스 결제 완료 처리 (추후 삭제 예정)
          // TossCustomer 레코드가 존재하는지 확인 후 업데이트
          const tossCustomer = await tx.tossCustomer.findUnique({
            where: {
              orderId: body.orderId,
            },
            select: {
              id: true,
            },
          });

          if (tossCustomer) {
            await tx.tossCustomer.update({
              where: {
                orderId: body.orderId,
              },
              data: {
                paymentStatus: "COMPLETED",
              },
            });
          } else {
            console.log(
              "[toss webhook] TossCustomer not found for orderId:",
              body.orderId
            );
          }

          // 수강 등록
          await tx.enrollment.upsert({
            where: {
              userId_courseId: {
                userId: existingPayment.order.userId,
                courseId: courseData.id,
              },
            },
            update: {
              courseOptionId:
                existingPayment.order.orderItems[0].productOptionId || null,
              startDate: new Date(),
              endDate: courseData.accessDuration
                ? calculateEndDate(new Date(), courseData.accessDuration)
                : null,
              isActive: true,
              enrollCount: {
                increment: 1,
              },
            },
            create: {
              userId: existingPayment.order.userId,
              courseId: courseData.id,
              courseOptionId:
                existingPayment.order.orderItems[0].productOptionId || null,
              startDate: new Date(),
              endDate: courseData.accessDuration
                ? calculateEndDate(new Date(), courseData.accessDuration)
                : null,
            },
          });

          revalidateTag(`course-${courseData.id}`);
        }
      });

      console.log("[toss webhook] success");
      return NextResponse.json({ success: true }, { status: 200 });
    }

    console.log("[toss webhook] status not DONE", body.status);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[toss webhook] error", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
