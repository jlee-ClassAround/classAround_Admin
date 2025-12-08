import { ResponseTaxInvoice } from "../types/tax-invoice-types";
import {
  getBoltaCustomerKey,
  getEncryptedBoltaApiKey,
} from "./get-bolta-api-info";

interface Props {
  issuanceKey: string;
  amount: number;
  orderName: string;
  isTaxFree: boolean;
}

export async function changeTaxInvoice({
  issuanceKey,
  amount,
  orderName,
  isTaxFree,
}: Props) {
  const today = new Date().toISOString().split("T")[0];
  const url = `https://xapi.bolta.io/v1/taxInvoices/${issuanceKey}/amend/changeSupplyCost`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getEncryptedBoltaApiKey(),
      "Customer-Key": getBoltaCustomerKey(),
    },
    body: JSON.stringify({
      date: today,
      items: [
        {
          date: today,
          name: orderName,
          ...(isTaxFree
            ? {
                supplyCost: -amount,
              }
            : {
                supplyCost: Math.floor(-amount / 1.1),
                tax: Math.floor((-amount / 1.1) * 0.1),
              }),
        },
      ],
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
