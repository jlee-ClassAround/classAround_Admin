import { ServerResponse } from "@/types/server-response";
import { TossPayment } from "../types/tosspayment-object";
import { getEncryptedSecretKey } from "./get-encrypted-secret-key";

interface Props {
  paymentKey: string;
  cancelReason: string | null;
  cancelAmount: number | string | null;
  isVirtualAccount?: boolean;
  bankCode?: string;
  accountNumber?: string;
  accountHolder?: string;
}

export async function refundPayment({
  paymentKey,
  cancelReason,
  cancelAmount,
  isVirtualAccount = false,
  bankCode,
  accountNumber,
  accountHolder,
}: Props): Promise<ServerResponse<TossPayment>> {
  const encryptedSecretKey = getEncryptedSecretKey();

  const url = `https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`;
  const options = {
    method: "POST",
    headers: {
      Authorization: encryptedSecretKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      cancelReason: cancelReason || "구매자가 취소를 원함",
      cancelAmount: cancelAmount ? Number(cancelAmount) : null,
      ...(isVirtualAccount && {
        refundReceiveAccount: {
          bank: bankCode,
          accountNumber: accountNumber,
          holderName: accountHolder,
        },
      }),
    }),
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (data.code) {
      throw new Error(data.message);
    }

    console.log("[refundPayment] 환불 성공");
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("[refundPayment] 환불 실패", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}
