"use server";

import { issueTaxInvoice } from "@/external-api/bolta/services/issue-tax-invoice";
import { issueCashReceipt } from "@/external-api/tosspayments/services/issue-cash-receipt";
import { db } from "@/lib/db";
import { getCachedSiteSetting } from "@/queries/global/site-setting";
import { ServerResponse } from "@/types/server-response";
import { getCashReceiptTypeToKr } from "@/utils/payments/get-enum-to-kr";
import { BillingType } from "@prisma/client";
import { addDays } from "date-fns";

export async function approveDirectDeposit(
  orderId: string,
  paymentId: string,
  userId: string,
  productId: string
): Promise<ServerResponse> {
  try {
    // 1. 데이터베이스 트랜잭션 처리
    await db.$transaction(async (tx) => {
      const existingOrder = await tx.order.findUnique({
        where: {
          id: orderId,
        },
        include: {
          user: true,
          orderItems: true,
          payments: {
            where: {
              id: paymentId,
            },
            include: {
              billingSnapshot: true,
            },
          },
        },
      });
      if (!existingOrder) {
        throw new Error("Order not found");
      }

      // 주문 정보 업데이트
      await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          status: "PAID",
          remainingAmount: 0,
          paidAmount: existingOrder.amount,
        },
        select: {
          id: true,
        },
      });

      // 결제 상태 업데이트
      const updatedPayment = await tx.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          paymentStatus: "DONE",
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
          status: "DONE",
          customerKey: userId,
          userId: userId,
          paymentId: paymentId,
          amount: updatedPayment.amount,
        },
        select: {
          id: true,
        },
      });

      const courseData = await tx.course.findUnique({
        where: {
          id: productId,
        },
      });
      if (!courseData) {
        throw new Error("Course not found");
      }

      // 강의 수강 등록
      await tx.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: userId,
            courseId: productId,
          },
        },
        update: {},
        create: {
          userId,
          courseId: productId,
          endDate: courseData.accessDuration
            ? addDays(new Date(), courseData.accessDuration)
            : null,
        },
      });

      const firstPaymentData = existingOrder.payments[0];
      const suppliedData = firstPaymentData.billingSnapshot;
      if (!suppliedData) {
        throw new Error("Supplied data not found");
      }

      // 현금영수증 발행
      if (
        firstPaymentData.billingSnapshot?.billingType ===
          BillingType.CASH_RECEIPT &&
        firstPaymentData.billingSnapshot?.cashReceiptType &&
        firstPaymentData.billingSnapshot?.receiptNumber
      ) {
        console.log("현금영수증 발행 시작");
        const cashReceiptResult = await issueCashReceipt({
          amount: updatedPayment.amount,
          orderId,
          orderName: existingOrder.orderName,
          customerIdentityNumber:
            firstPaymentData.billingSnapshot.receiptNumber,
          type: getCashReceiptTypeToKr(
            firstPaymentData.billingSnapshot?.cashReceiptType
          ) as "소득공제" | "지출증빙",
        });

        if (!cashReceiptResult.success) {
          throw new Error(cashReceiptResult.message);
        }

        await tx.cashReceiptHistory.create({
          data: {
            receiptKey: cashReceiptResult.data.receiptKey,
            paymentId,
            type: firstPaymentData.billingSnapshot?.cashReceiptType,
            issueNumber: cashReceiptResult.data.issueNumber,
            receiptUrl: cashReceiptResult.data.receiptUrl,
            status: "ISSUED",
            amount: updatedPayment.amount,
          },
        });
      }

      // 세금계산서 발행
      if (
        firstPaymentData.billingSnapshot?.billingType ===
        BillingType.TAX_INVOICE
      ) {
        const siteSetting = await getCachedSiteSetting();
        if (
          !siteSetting ||
          !siteSetting.businessNumber ||
          !siteSetting.companyName ||
          !siteSetting.ceoName ||
          !siteSetting.managerEmail ||
          !siteSetting.managerName ||
          !siteSetting.managerPhone ||
          !siteSetting.businessAddress ||
          !siteSetting.businessType ||
          !siteSetting.businessItem
        ) {
          throw new Error("사업자 정보가 입력되지 않았습니다");
        }
        if (
          !suppliedData.businessNumber ||
          !suppliedData.companyName ||
          !suppliedData.ceoName ||
          !suppliedData.contactEmail ||
          !suppliedData.contactName ||
          !suppliedData.contactPhone ||
          !suppliedData.businessAddress ||
          !suppliedData.businessType ||
          !suppliedData.businessItem
        ) {
          throw new Error("공급받는자 정보가 없습니다");
        }

        console.log("세금계산서 발행 시작");
        const issueResult = await issueTaxInvoice({
          amount: updatedPayment.amount,
          orderName: existingOrder.orderName,
          isTaxFree: courseData.isTaxFree,
          supplier: {
            identificationNumber: siteSetting.businessNumber,
            organizationName: siteSetting.companyName,
            representativeName: siteSetting.ceoName,
            manager: {
              email: siteSetting.managerEmail,
              name: siteSetting.managerName,
              telephone: siteSetting.managerPhone,
            },
            address: siteSetting.businessAddress,
            businessType: siteSetting.businessType,
            businessItem: siteSetting.businessItem,
          },
          supplied: {
            identificationNumber: suppliedData.businessNumber,
            organizationName: suppliedData.companyName,
            representativeName: suppliedData.ceoName,
            managers: [
              {
                email: suppliedData.contactEmail,
                name: suppliedData.contactName,
                telephone: suppliedData.contactPhone,
              },
            ],
            address: suppliedData.businessAddress,
            businessType: suppliedData.businessType,
            businessItem: suppliedData.businessItem,
          },
        });

        if (!issueResult.success) {
          throw new Error(issueResult.message);
        }

        await tx.taxInvoiceHistory.create({
          data: {
            paymentId,
            issuanceKey: issueResult.data.issuanceKey,
            status: "ISSUANCE_REQUESTED",
            amount: updatedPayment.amount,
          },
        });
      }
    });
    return { success: true };
  } catch (error) {
    console.error("[APPROVE_DIRECT_DEPOSIT_ERROR]: ", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "승인 처리 실패",
    };
  }
}
