import { refundPayment } from "@/external-api/tosspayments/services/refund-payment";
import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const {
      paymentId,
      cancelReason,
      cancelAmount,
      isDeleteEnrollment,
      bankCode,
      accountNumber,
      accountHolder,
    } = await req.json();

    // 결제 정보 조회
    const payment = await db.tossCustomer.findUnique({
      where: { id: paymentId },
      select: {
        orderId: true,
        paymentKey: true,
        paymentStatus: true,
        finalPrice: true,
        refundableAmount: true,
        paymentMethod: true,
      },
    });

    if (!payment) {
      return new NextResponse("Payment not found", { status: 404 });
    }

    if (payment.finalPrice === 0) {
      return new NextResponse("무료 결제는 환불이 불가능합니다.", {
        status: 400,
      });
    }

    if (
      payment.paymentStatus === "REFUNDED" &&
      payment.refundableAmount === 0
    ) {
      return new NextResponse("환불 가능 금액이 없습니다.", { status: 400 });
    }

    // 임시: Payment 조회
    const newPayment = await db.payment.findUnique({
      where: { id: payment.orderId },
      select: {
        id: true,
        amount: true,
      },
    });

    // 토스페이먼츠 환불 API 호출
    const isVirtualAccount = payment.paymentMethod === "VIRTUAL_ACCOUNT";
    const isWaitingForDeposit = payment.paymentStatus === "WAITING_FOR_DEPOSIT";
    const tossRefundResult = await refundPayment({
      paymentKey: payment.paymentKey,
      cancelReason,
      cancelAmount,
      isVirtualAccount: isVirtualAccount && !isWaitingForDeposit,
      ...(isVirtualAccount &&
        !isWaitingForDeposit && {
          bankCode,
          accountNumber,
          accountHolder,
        }),
    });
    if (!tossRefundResult.success) {
      return NextResponse.json(
        { success: false, message: tossRefundResult.message },
        { status: 400 }
      );
    }

    const { cancels } = tossRefundResult.data;
    if (!cancels) {
      return NextResponse.json(
        { success: false, message: "환불 정보를 찾을 수 없습니다." },
        { status: 400 }
      );
    }
    const { refundableAmount } = cancels[cancels.length - 1];

    // DB 업데이트
    await db.$transaction(async (tx) => {
      // 임시: newPayment 업데이트
      if (newPayment) {
        const updatedNewPayment = await tx.payment.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus:
              refundableAmount && refundableAmount > 0
                ? "PARTIAL_CANCELED"
                : "CANCELED",
          },
          select: {
            id: true,
            isTaxFree: true,
          },
        });

        await tx.paymentCancel.create({
          data: {
            paymentId: updatedNewPayment.id,
            cancelAmount: cancelAmount
              ? Number(cancelAmount)
              : refundableAmount,
            cancelReason,
            taxFreeAmount: updatedNewPayment.isTaxFree
              ? Number(cancelAmount)
              : 0,
            refundableAmount,
          },
        });
      }

      const updatedPayment = await tx.tossCustomer.update({
        where: { id: paymentId },
        data: {
          paymentStatus:
            refundableAmount && refundableAmount > 0
              ? "PARTIAL_REFUNDED"
              : "REFUNDED",
          cancelAmount: payment.finalPrice - (refundableAmount ?? 0),
          cancelReason,
          refundableAmount,
          canceledAt: new Date(),
        },
      });

      if (
        isDeleteEnrollment &&
        updatedPayment.productType === "COURSE" &&
        updatedPayment.userId &&
        updatedPayment.courseId
      ) {
        const existingEnrollment = await db.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: updatedPayment.userId,
              courseId: updatedPayment.courseId,
            },
          },
        });

        if (existingEnrollment) {
          await tx.enrollment.delete({
            where: {
              userId_courseId: {
                userId: updatedPayment.userId,
                courseId: updatedPayment.courseId,
              },
            },
          });
        }
      }

      if (
        isDeleteEnrollment &&
        updatedPayment.productType === "EBOOK" &&
        updatedPayment.userId &&
        updatedPayment.ebookId
      ) {
        const existingEbookPurchase = await db.ebookPurchase.findUnique({
          where: {
            userId_ebookId: {
              userId: updatedPayment.userId,
              ebookId: updatedPayment.ebookId,
            },
          },
        });

        if (existingEbookPurchase) {
          await tx.ebookPurchase.delete({
            where: {
              userId_ebookId: {
                userId: updatedPayment.userId,
                ebookId: updatedPayment.ebookId,
              },
            },
          });
        }
      }

      revalidateTag(`course-${updatedPayment.courseId}`);
    });

    return NextResponse.json({ message: "환불 처리 완료" });
  } catch (error) {
    console.error("[PAYMENT_REFUND_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
