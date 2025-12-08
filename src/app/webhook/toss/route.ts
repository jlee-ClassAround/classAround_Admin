import { db } from "@/lib/db";
import { TossPaymentWebhookBody } from "@/external-api/tosspayments/types/webhook-response";
import { calculateEndDate } from "@/utils/date-utils";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body: TossPaymentWebhookBody = await request.json();
    console.log("[toss webhook] body", body);

    // TossCustomer 기준으로 데이터 조회
    const tossCustomer = await db.tossCustomer.findUnique({
      where: {
        orderId: body.orderId,
      },
      select: {
        id: true,
        orderId: true,
        paymentStatus: true,
        tossSecretKey: true,
        userId: true,
        courseId: true,
        ebookId: true,
        productId: true,
        productOptionId: true,
        productType: true,
        finalPrice: true,
        paymentMethod: true,
        course: {
          select: {
            id: true,
            accessDuration: true,
          },
        },
        ebook: {
          select: {
            id: true,
          },
        },
      },
    });

    // TossCustomer 조회 실패
    if (!tossCustomer) {
      console.error("[toss webhook] TossCustomer not found", body.orderId);
      return NextResponse.json(
        { success: false, message: "TossCustomer not found" },
        { status: 404 }
      );
    }

    // 시크릿 키 검증
    if (!body?.secret || body.secret !== tossCustomer.tossSecretKey) {
      console.error("[toss webhook] Secret key mismatch", body.orderId);
      return NextResponse.json(
        { success: false, message: "Secret key mismatch" },
        { status: 404 }
      );
    }

    // 중복 처리 방지 - 이미 처리된 결제인지 확인
    if (tossCustomer.paymentStatus === "COMPLETED") {
      console.log("[toss webhook] Already processed", body.orderId);
      return NextResponse.json(
        { success: true, message: "Already processed" },
        { status: 200 }
      );
    }

    if (body.status === "DONE") {
      await db.$transaction(async (tx) => {
        // 유저 정보 확인
        if (!tossCustomer.userId) {
          return NextResponse.json(
            { success: false, message: "User not found" },
            { status: 404 }
          );
        }

        // Order와 Payment 조회 (존재하는 경우)
        const order = await tx.order.findUnique({
          where: {
            id: tossCustomer.orderId,
          },
          select: {
            id: true,
            userId: true,
            remainingAmount: true,
            paidAmount: true,
            status: true,
          },
        });

        const payment = await tx.payment.findFirst({
          where: {
            orderId: tossCustomer.orderId,
            tossPaymentKey: body.transactionKey,
          },
          select: {
            id: true,
            amount: true,
            paymentStatus: true,
          },
        });

        // 코스/이북 정보 확인 및 처리
        if (tossCustomer.productType === "COURSE") {
          if (!tossCustomer.courseId || !tossCustomer.course) {
            return NextResponse.json(
              { success: false, message: "Course not found" },
              { status: 404 }
            );
          }

          const courseData = tossCustomer.course;

          // Order가 있는 경우 주문 상태 업데이트
          if (order && payment) {
            const remainingAmount = order.remainingAmount - payment.amount;
            const isCompleted = remainingAmount === 0;

            await tx.order.update({
              where: {
                id: order.id,
              },
              data: {
                remainingAmount,
                ...(isCompleted && { status: "PAID" }),
                paidAmount: order.paidAmount + payment.amount,
              },
            });

            await tx.payment.update({
              where: {
                id: payment.id,
              },
              data: {
                paymentStatus: "DONE",
              },
            });

            // 거래 내역 생성
            await tx.transaction.create({
              data: {
                orderId: order.id,
                paymentId: payment.id,
                method: tossCustomer.paymentMethod,
                status: "DONE",
                customerKey: tossCustomer.userId,
                amount: payment.amount,
                userId: tossCustomer.userId,
              },
            });
          }

          // TossCustomer 결제 상태 업데이트
          await tx.tossCustomer.update({
            where: {
              orderId: body.orderId,
            },
            data: {
              paymentStatus: "COMPLETED",
            },
          });

          // 수강 등록
          await tx.enrollment.upsert({
            where: {
              userId_courseId: {
                userId: tossCustomer.userId,
                courseId: courseData.id,
              },
            },
            update: {
              courseOptionId: tossCustomer.productOptionId || null,
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
              userId: tossCustomer.userId,
              courseId: courseData.id,
              courseOptionId: tossCustomer.productOptionId || null,
              startDate: new Date(),
              endDate: courseData.accessDuration
                ? calculateEndDate(new Date(), courseData.accessDuration)
                : null,
            },
          });

          revalidateTag(`course-${courseData.id}`);
        } else if (tossCustomer.productType === "EBOOK") {
          if (!tossCustomer.ebookId || !tossCustomer.ebook) {
            return NextResponse.json(
              { success: false, message: "Ebook not found" },
              { status: 404 }
            );
          }

          // Order가 있는 경우 주문 상태 업데이트
          if (order && payment) {
            const remainingAmount = order.remainingAmount - payment.amount;
            const isCompleted = remainingAmount === 0;

            await tx.order.update({
              where: {
                id: order.id,
              },
              data: {
                remainingAmount,
                ...(isCompleted && { status: "PAID" }),
                paidAmount: order.paidAmount + payment.amount,
              },
            });

            await tx.payment.update({
              where: {
                id: payment.id,
              },
              data: {
                paymentStatus: "DONE",
              },
            });

            // 거래 내역 생성
            await tx.transaction.create({
              data: {
                orderId: order.id,
                paymentId: payment.id,
                method: tossCustomer.paymentMethod,
                status: "DONE",
                customerKey: tossCustomer.userId,
                amount: payment.amount,
                userId: tossCustomer.userId,
              },
            });
          }

          // TossCustomer 결제 상태 업데이트
          await tx.tossCustomer.update({
            where: {
              orderId: body.orderId,
            },
            data: {
              paymentStatus: "COMPLETED",
            },
          });

          // 이북 구매 등록
          await tx.ebookPurchase.upsert({
            where: {
              userId_ebookId: {
                userId: tossCustomer.userId,
                ebookId: tossCustomer.ebookId,
              },
            },
            update: {
              purchasePrice: tossCustomer.finalPrice,
              lastDownloadAt: new Date(),
            },
            create: {
              userId: tossCustomer.userId,
              ebookId: tossCustomer.ebookId,
              purchasePrice: tossCustomer.finalPrice,
            },
          });
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
