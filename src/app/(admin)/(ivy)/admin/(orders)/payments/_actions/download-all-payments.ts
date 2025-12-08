"use server";

import { db } from "@/lib/db";
import { formatPrice } from "@/utils/formats";
import {
  getPaymentMethodToKr,
  getPaymentStatusToKr,
} from "@/utils/payments/get-enum-to-kr";
import { getProductCategoryToKr } from "@/utils/products/get-enum-to-kr";
import * as XLSX from "xlsx";

export async function downloadAllPayments(): Promise<{
  success: boolean;
  message: string;
  data?: string;
}> {
  try {
    // 전체 결제 데이터 조회 (페이지네이션 없이)
    const payments = await db.payment.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                phone: true,
              },
            },
            orderItems: {
              select: {
                id: true,
                productTitle: true,
                productCategory: true,
                quantity: true,
                originalPrice: true,
                discountedPrice: true,
              },
            },
          },
        },
        paymentCancels: {
          where: {
            cancelStatus: "DONE",
          },
          select: {
            cancelAmount: true,
            cancelReason: true,
            canceledAt: true,
          },
        },
      },
    });

    // 엑셀 데이터 변환
    const excelData = payments.map((payment) => ({
      "결제 ID": payment.id,
      주문명: payment.order.orderName,
      상품명: payment.order.orderItems
        .map((item) => item.productTitle)
        .join(", "),
      구매자명: payment.order.user?.username || "-",
      전화번호: payment.order.user?.phone || "-",
      이메일: payment.order.user?.email || "-",
      상품유형: payment.order.orderItems
        .map((item) => getProductCategoryToKr(item.productCategory))
        .join(", "),
      결제금액: formatPrice(payment.amount),
      결제상태: getPaymentStatusToKr(payment.paymentStatus),
      면세여부: payment.isTaxFree ? "면세" : "과세",
      결제일시: payment.createdAt.toLocaleString("ko-KR"),
      결제수단: getPaymentMethodToKr(payment.paymentMethod),
      결제키: payment.tossPaymentKey,
      환불금액: payment.paymentCancels.reduce(
        (sum, cancel) => sum + cancel.cancelAmount,
        0
      ),
      환불일시: payment.paymentCancels
        .map((cancel) => cancel.canceledAt.toLocaleString("ko-KR"))
        .join(", "),
      환불사유: payment.paymentCancels
        .map((cancel) => cancel.cancelReason)
        .join(", "),
    }));

    // 엑셀 워크북 생성
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // 컬럼 너비 설정
    const columnWidths = [
      { wch: 15 }, // 결제 ID
      { wch: 25 }, // 주문명
      { wch: 20 }, // 상품명
      { wch: 10 }, // 구매자명
      { wch: 15 }, // 전화번호
      { wch: 15 }, // 이메일
      { wch: 10 }, // 상품유형
      { wch: 10 }, // 결제금액
      { wch: 10 }, // 결제상태
      { wch: 10 }, // 면세여부
      { wch: 20 }, // 결제일시
      { wch: 10 }, // 결제수단
      { wch: 10 }, // 결제키
      { wch: 10 }, // 환불금액
      { wch: 15 }, // 환불일시
      { wch: 15 }, // 환불사유
    ];
    worksheet["!cols"] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, "전체결제내역");

    // Base64로 변환
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    const base64 = buffer.toString("base64");

    return {
      success: true,
      message: "전체 데이터 다운로드가 완료되었습니다.",
      data: base64,
    };
  } catch (error) {
    console.error("[DOWNLOAD_ALL_PAYMENTS_ERROR]", error);
    return {
      success: false,
      message: "다운로드 중 오류가 발생했습니다.",
    };
  }
}
