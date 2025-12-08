import { getEncryptedSecretKey } from "./get-encrypted-secret-key";

interface GetPaymentResponse {
  metadata: {
    couponId: string | null;
    userId: string | null;
    courseId: string | null;
    optionId?: string;
  };
}

export const getPayment = async (
  paymentKey: string
): Promise<GetPaymentResponse> => {
  const encryptedSecretKey = getEncryptedSecretKey();

  const response = await fetch(
    `https://api.tosspayments.com/v1/payments/${paymentKey}`,
    {
      method: "GET",
      headers: { Authorization: encryptedSecretKey },
    }
  );
  const data = await response.json();
  console.log("[GET_PAYMENT_DATA]", data);

  return data;
};
