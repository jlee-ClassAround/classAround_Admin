import { Failure, TossPayment } from "../types/tosspayment-object";
import { getEncryptedSecretKey } from "./get-encrypted-secret-key";

interface Props {
  orderId: string;
  amount: number;
  paymentKey: string;
}

export function isTossPaymentFailure(
  data: TossPayment | Failure
): data is Failure {
  return "code" in data;
}

export const confirmPayment = async ({
  orderId,
  amount,
  paymentKey,
}: Props): Promise<TossPayment | Failure> => {
  const encryptedSecretKey = getEncryptedSecretKey();

  // 토스페이먼츠 최종 승인 요청
  const response = await fetch(
    "https://api.tosspayments.com/v1/payments/confirm",
    {
      method: "POST",
      body: JSON.stringify({
        orderId,
        amount,
        paymentKey,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: encryptedSecretKey,
        "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
        // Test Code
        // "TossPayments-Test-Code": "REJECT_CARD_PAYMENT",
      },
    }
  );
  const data = await response.json();
  // console.log("[PAYMENT_CONFIRM_SUCCESS]", data);

  return data;
};
