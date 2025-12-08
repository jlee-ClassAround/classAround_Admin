import { ResponseTaxInvoice } from "../types/tax-invoice-types";
import {
  getBoltaCustomerKey,
  getEncryptedBoltaApiKey,
} from "./get-bolta-api-info";

interface Props {
  issuanceKey: string;
}

export async function cancelTaxInvoice({ issuanceKey }: Props) {
  const url = `https://xapi.bolta.io/v1/taxInvoices/${issuanceKey}/amend/termination`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getEncryptedBoltaApiKey(),
      "Customer-Key": getBoltaCustomerKey(),
    },
    body: JSON.stringify({
      date: new Date().toISOString().split("T")[0],
    }),
  };

  try {
    const response = await fetch(url, options);
    const data: ResponseTaxInvoice = await response.json();

    if (!data?.issuanceKey) {
      console.log("[cancelTaxInvoice] 세금계산서 취소 실패", data);
      return {
        success: false,
        code: data?.code,
        message: data?.message,
      };
    }

    console.log("[cancelTaxInvoice] 세금계산서 취소 성공");
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("[cancelTaxInvoice] 세금계산서 취소 실패", error);
    return {
      success: false,
    };
  }
}
