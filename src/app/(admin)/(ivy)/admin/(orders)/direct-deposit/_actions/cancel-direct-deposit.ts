"use server";

import { db } from "@/lib/db";
import { BillingType } from "@prisma/client";
import { cancelTaxInvoice } from "@/external-api/bolta/services/cancel-tax-invoice";
import { changeTaxInvoice } from "@/external-api/bolta/services/change-tax-invoice";
import { cancelCashReceipt } from "@/external-api/tosspayments/services/cancel-cash-receipt";
import { ServerResponse } from "@/types/server-response";

export async function cancelDirectDeposit(
  orderId: string,
  paymentId: string,
  userId: string,
  productId: string,
  cancelAmount: number,
  cancelReason: string
): Promise<ServerResponse> {
  try {
    await db.$transaction(async (tx) => {
      const orderData = await tx.order.findUnique({
        where: {
          id: orderId,
        },
        include: {
          payments: {
            where: {
              id: paymentId,
            },
            include: {
              billingSnapshot: true,
              cashReceiptHistories: true,
              taxInvoiceHistories: true,
            },
          },
        },
      });

      if (!orderData) {
        throw new Error("Order not found");
      }

      const firstPaymentData = orderData.payments[0];

      // 환불 가능 금액 계산
      const remainingAmount =
        firstPaymentData.refundableAmount ?? firstPaymentData.amount;

      if (cancelAmount > remainingAmount) {
        cancelAmount = remainingAmount;
      }

      // TODO: 로직 확인 필요

      // 환불 후 남은 금액 계산
      const newRemainingAmount = remainingAmount - cancelAmount;

      // 환불 상태 결정
      const newOrderStatus =
        newRemainingAmount === 0 ? "REFUNDED" : "PARTIAL_REFUNDED";
      const newPaymentStatus =
        newRemainingAmount === 0 ? "CANCELED" : "PARTIAL_CANCELED";

      // 주문 정보 업데이트
      await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          status: newOrderStatus,
          remainingAmount: newRemainingAmount,
          paidAmount: orderData.paidAmount - cancelAmount,
        },
        select: {
          id: true,
        },
      });

      // Payment 업데이트
      await tx.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          paymentStatus: newPaymentStatus,
          refundableAmount: newRemainingAmount,
          cancelAmount: orderData.amount - newRemainingAmount,
          cancelReason: cancelReason || null,
          canceledAt: new Date(),
        },
        select: {
          amount: true,
        },
      });

      // 거래 내역 생성
      await tx.transaction.create({
        data: {
          orderId,
          method: "DIRECT_DEPOSIT",
          status: newPaymentStatus,
          customerKey: userId,
          userId: userId,
          paymentId,
          amount: cancelAmount, // 실제 취소된 금액
        },
      });

      await tx.enrollment.deleteMany({
        where: {
          userId: userId,
          courseId: productId,
        },
      });

      // 현금영수증 취소 처리
      if (
        firstPaymentData.billingSnapshot?.billingType ===
        BillingType.CASH_RECEIPT
      ) {
        const cashReceiptResult = await cancelCashReceipt({
          receiptKey: firstPaymentData.cashReceiptHistories[0]?.receiptKey,
          amount: cancelAmount, // 실제 취소된 금액
        });
        if (!cashReceiptResult.success) {
          throw new Error(cashReceiptResult.message);
        }
        await tx.cashReceiptHistory.create({
          data: {
            paymentId,
            receiptKey: cashReceiptResult.data.receiptKey,
            status: newPaymentStatus,
            type:
              firstPaymentData.billingSnapshot?.cashReceiptType ?? "소득공제",
            issueNumber: cashReceiptResult.data.issueNumber,
            receiptUrl: cashReceiptResult.data.receiptUrl,
            amount: cancelAmount, // 실제 취소된 금액
          },
        });
      }

      // 세금계산서 취소 처리
      if (
        firstPaymentData.billingSnapshot?.billingType ===
        BillingType.TAX_INVOICE
      ) {
        let taxInvoiceResult;
        if (newPaymentStatus === "CANCELED") {
          taxInvoiceResult = await cancelTaxInvoice({
            issuanceKey: firstPaymentData.taxInvoiceHistories[0].issuanceKey,
          });
        } else {
          taxInvoiceResult = await changeTaxInvoice({
            issuanceKey: firstPaymentData.taxInvoiceHistories[0].issuanceKey,
            amount: cancelAmount,
            orderName: orderData.orderName,
            isTaxFree: firstPaymentData.isTaxFree,
          });
        }

        if (!taxInvoiceResult.success) {
          throw new Error(taxInvoiceResult.message);
        }

        await tx.taxInvoiceHistory.create({
          data: {
            paymentId,
            issuanceKey: taxInvoiceResult.data?.issuanceKey,
            status: "CANCEL_REQUESTED",
            amount: cancelAmount, // 실제 취소된 금액
          },
        });
      }
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("[CANCEL_DIRECT_DEPOSIT_ERROR]: ", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "환불 처리 실패",
    };
  }
}
