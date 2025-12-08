import { ServerResponse } from "@/types/server-response";
import { getEncryptedSecretKey } from "./get-encrypted-secret-key";
import { TossPaymentCashReceipt } from "../types/tosspayment-cash-receipt";

interface Props {
  receiptKey: string;
  amount?: number;
}

export async function cancelCashReceipt({
  receiptKey,
  amount,
}: Props): Promise<ServerResponse<TossPaymentCashReceipt>> {
  const encryptedSecretKey = getEncryptedSecretKey();

  const url = `https://api.tosspayments.com/v1/cash-receipts/${receiptKey}/cancel`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: encryptedSecretKey,
    },
    ...(amount && {
      body: JSON.stringify({
        amount,
      }),
    }),
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    console.log("[cancelCashReceipt] 현금영수증 취소 성공");
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("[cancelCashReceipt] 현금영수증 취소 실패", error);
    return {
      success: false,
      message: `[cancelCashReceipt] ERROR: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`,
    };
  }
}
