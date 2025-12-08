"use server";

import { refundPayment } from "@/external-api/tosspayments/services/refund-payment";
import { db } from "@/lib/db";
import { ServerResponse } from "@/types/server-response";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { revalidateTag } from "next/cache";

interface Props {
  paymentId: string;
  cancelReason: string;
  cancelAmount: number;
  isKeepEnrollment: boolean;
  accountNumber?: string;
  accountHolder?: string;
  bankCode?: string;
}

export async function cancelPayment({
  paymentId,
  cancelReason,
  cancelAmount,
  isKeepEnrollment,
  accountNumber,
  accountHolder,
  bankCode,
}: Props): Promise<ServerResponse> {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    // 결제 정보 조회
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      select: {
        tossPaymentKey: true,
        paymentStatus: true,
        amount: true,
        paymentMethod: true,
        refundableAmount: true,
      },
    });

    // 임시: TossCustomer 조회
    const tossCustomer = await db.tossCustomer.findUnique({
      where: { orderId: paymentId },
      select: {
        id: true,
      },
    });

    if (!payment) {
      return {
        success: false,
        message: "Payment not found",
      };
    }

    if (payment.amount === 0) {
      return {
        success: false,
        message: "무료 결제는 환불이 불가능합니다.",
      };
    }

    if (
      payment.paymentStatus === "CANCELED" &&
      payment.refundableAmount === 0
    ) {
      return {
        success: false,
        message: "환불 가능 금액이 없습니다.",
      };
    }

    if (!payment.tossPaymentKey) {
      return {
        success: false,
        message: "결제 정보를 찾을 수 없습니다.",
      };
    }

    const isVirtualAccount = payment.paymentMethod === "VIRTUAL_ACCOUNT";
    if (isVirtualAccount && (!bankCode || !accountNumber || !accountHolder)) {
      return {
        success: false,
        message: "가상계좌 정보를 입력해주세요.",
      };
    }

    // 토스페이먼츠 환불 API 호출
    const tossRefundResult = await refundPayment({
      paymentKey: payment.tossPaymentKey,
      cancelReason,
      cancelAmount,
      isVirtualAccount,
      bankCode,
      accountNumber,
      accountHolder,
    });
    if (!tossRefundResult.success) {
      return {
        success: false,
        message: tossRefundResult.message,
      };
    }

    const { cancels } = tossRefundResult.data;
    if (!cancels) {
      return {
        success: false,
        message: "환불 정보를 찾을 수 없습니다.",
      };
    }
    const { refundableAmount } = cancels[cancels.length - 1];

    // DB 업데이트
    await db.$transaction(async (tx) => {
      // 삭제 예정: TossCustomer 업데이트
      if (tossCustomer) {
        await tx.tossCustomer.update({
          where: { id: tossCustomer.id },
          data: {
            paymentStatus:
              refundableAmount && refundableAmount > 0
                ? "PARTIAL_REFUNDED"
                : "REFUNDED",
            cancelAmount: payment.amount - (refundableAmount ?? 0),
            cancelReason,
            refundableAmount,
            canceledAt: new Date(),
          },
        });
      }

      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          paymentStatus:
            refundableAmount && refundableAmount > 0
              ? "PARTIAL_CANCELED"
              : "CANCELED",
          cancelAmount: payment.amount - (refundableAmount ?? 0),
          cancelReason,
          refundableAmount,
          canceledAt: new Date(),
        },
        select: {
          isTaxFree: true,
          order: {
            select: {
              userId: true,
              orderItems: {
                select: {
                  productCategory: true,
                  productId: true,
                  productOptionId: true,
                  productOption: true,
                },
              },
            },
          },
        },
      });

      await tx.paymentCancel.create({
        data: {
          paymentId,
          cancelAmount,
          cancelReason,
          taxFreeAmount: updatedPayment.isTaxFree ? cancelAmount : 0,
          refundableAmount,
        },
      });

      if (
        !isKeepEnrollment &&
        updatedPayment.order.orderItems[0].productCategory === "COURSE" &&
        updatedPayment.order.userId &&
        updatedPayment.order.orderItems[0].productId
      ) {
        const existingEnrollment = await db.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: updatedPayment.order.userId,
              courseId: updatedPayment.order.orderItems[0].productId,
            },
          },
        });

        if (existingEnrollment) {
          await tx.enrollment.delete({
            where: {
              userId_courseId: {
                userId: updatedPayment.order.userId,
                courseId: updatedPayment.order.orderItems[0].productId,
              },
            },
          });
        }
      }

      if (
        !isKeepEnrollment &&
        updatedPayment.order.orderItems[0].productCategory === "EBOOK" &&
        updatedPayment.order.userId &&
        updatedPayment.order.orderItems[0].productId
      ) {
        const existingEbookPurchase = await db.ebookPurchase.findUnique({
          where: {
            userId_ebookId: {
              userId: updatedPayment.order.userId,
              ebookId: updatedPayment.order.orderItems[0].productId,
            },
          },
        });

        if (existingEbookPurchase) {
          await tx.ebookPurchase.delete({
            where: {
              userId_ebookId: {
                userId: updatedPayment.order.userId,
                ebookId: updatedPayment.order.orderItems[0].productId,
              },
            },
          });
        }
      }

      revalidateTag(`course-${updatedPayment.order.orderItems[0].productId}`);
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("[PAYMENT_REFUND_ERROR]", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "환불 처리 실패",
    };
  }
}
