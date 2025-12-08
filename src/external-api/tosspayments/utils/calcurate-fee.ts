import { PaymentMethod } from "@/constants/payments/payment-method";
import {
  CARD_FEE,
  KAKAO_PAY_FEE,
  NAVER_PAY_FEE,
  TOSS_PAY_FEE,
  TRANSFER_FEE,
  VIRTUAL_ACCOUNT_FEE,
} from "../constants/fee";

export type EasyPayType = "카카오페이" | "네이버페이" | "토스페이";

export function calculateFee(
  amount: number,
  paymentMethod: PaymentMethod,
  easyPayType?: EasyPayType
) {
  switch (paymentMethod) {
    case "CARD":
      return amount * CARD_FEE;
    case "TRANSFER":
      return amount * TRANSFER_FEE;
    case "VIRTUAL_ACCOUNT":
      return VIRTUAL_ACCOUNT_FEE;
    case "EASY_PAY":
      if (easyPayType === "카카오페이") {
        return amount * KAKAO_PAY_FEE;
      } else if (easyPayType === "네이버페이") {
        return amount * NAVER_PAY_FEE;
      } else if (easyPayType === "토스페이") {
        return amount * TOSS_PAY_FEE;
      }
    default:
      return 0;
  }
}
