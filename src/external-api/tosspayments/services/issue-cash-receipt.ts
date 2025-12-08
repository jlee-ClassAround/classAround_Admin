import { ServerResponse } from "@/types/server-response";
import { TossPaymentCashReceipt } from "../types/tosspayment-cash-receipt";
import { getEncryptedSecretKey } from "./get-encrypted-secret-key";

interface Props {
  amount: number;
  orderId: string;
  orderName: string;
  customerIdentityNumber: string;
  type: "소득공제" | "지출증빙";
}

export async function issueCashReceipt({
  amount,
  orderId,
  orderName,
  customerIdentityNumber,
  type,
}: Props): Promise<ServerResponse<TossPaymentCashReceipt>> {
  const encryptedSecretKey = getEncryptedSecretKey();

  const url = "https://api.tosspayments.com/v1/cash-receipts";
  const options = {
    method: "POST",
    headers: {
      Authorization: encryptedSecretKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      orderId,
      orderName,
      customerIdentityNumber,
      type,
    }),
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!data.receiptKey) {
      console.error(
        "[issueCashReceipt API ERROR] 현금영수증 발행 실패: ",
        data
      );
      return {
        success: false,
        message: data?.message ?? "알 수 없는 오류",
      };
    }

    console.info("[issueCashReceipt] 현금영수증 발행 성공");
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("[issueCashReceipt ERROR] 현금영수증 발행 실패", error);
    return {
      success: false,
      message: `현금영수증 발행 실패: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`,
    };
  }
}
