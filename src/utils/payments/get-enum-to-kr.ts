import {
  BillingType,
  CashReceiptStatus,
  CashReceiptType,
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
  TaxInvoiceStatus,
} from "@prisma/client";

export function getOrderTypeToKr(orderType: OrderType | null) {
  switch (orderType) {
    case "BULK_PAYMENT":
      return "일괄결제";
    case "SPLIT_PAYMENT":
      return "분할결제";
    default:
      return "-";
  }
}

export function getBillingTypeToKr(receiptType: BillingType | null) {
  switch (receiptType) {
    case "CASH_RECEIPT":
      return "현금영수증";
    case "TAX_INVOICE":
      return "세금계산서";
    default:
      return "-";
  }
}

export function getCashReceiptTypeToKr(receiptType: CashReceiptType | null) {
  switch (receiptType) {
    case "INCOME_DEDUCTION":
      return "소득공제";
    case "PROOF_OF_EXPENSE":
      return "지출증빙";
    default:
      return "-";
  }
}

export function getOrderStatusToKr(orderStatus: OrderStatus | null) {
  switch (orderStatus) {
    case "PENDING":
      return "결제준비";
    case "IN_PARTIAL_PROGRESS":
      return "분할 결제중";
    case "PAID":
      return "결제완료";
    case "PARTIAL_REFUNDED":
      return "부분 환불됨";
    case "REFUNDED":
      return "환불됨";
    case "REFUND_REQUESTED":
      return "환불요청중";
    case "REFUND_FAILED":
      return "환불실패";
    case "CANCELED":
      return "취소됨";
    case "FAILED":
      return "결제실패";
    default:
      return "-";
  }
}

export function getPaymentMethodToKr(paymentMethod: PaymentMethod | null) {
  switch (paymentMethod) {
    case "CARD":
      return "카드";
    case "TRANSFER":
      return "계좌이체";
    case "VIRTUAL_ACCOUNT":
      return "가상계좌";
    case "EASY_PAY":
      return "간편결제";
    case "DIRECT_DEPOSIT":
      return "직접 계좌이체";
    default:
      return "-";
  }
}

export function getPaymentStatusToKr(paymentStatus: PaymentStatus | null) {
  switch (paymentStatus) {
    case "READY":
      return "결제준비";
    case "WAITING_FOR_DEPOSIT":
      return "입금대기";
    case "WAITING_FOR_DIRECT_DEPOSIT":
      return "직접 입금대기";
    case "DONE":
      return "결제완료";
    case "CANCELED":
      return "취소됨";
    case "PARTIAL_CANCELED":
      return "부분취소";
    case "FAILED":
      return "결제실패";
    default:
      return "-";
  }
}

export function getCashReceiptStatusToKr(
  cashReceiptStatus: CashReceiptStatus | null
) {
  switch (cashReceiptStatus) {
    case "ISSUED":
      return "발행됨";
    case "CANCELED":
      return "취소됨";
    case "PARTIAL_CANCELED":
      return "부분취소";
    default:
      return "-";
  }
}

export function getTaxInvoiceStatusToKr(
  taxInvoiceStatus: TaxInvoiceStatus | null
) {
  switch (taxInvoiceStatus) {
    case "ISSUED":
      return "발행됨";
    case "CANCELED":
      return "취소됨";
    case "ISSUANCE_REQUESTED":
      return "발행요청중";
    case "CANCEL_REQUESTED":
      return "취소요청중";
    default:
      return "-";
  }
}
