import { ServerResponse } from "@/types/server-response";
import {
  RequestTaxInvoice,
  ResponseTaxInvoice,
  발행목적,
} from "../types/tax-invoice-types";
import {
  getBoltaCustomerKey,
  getEncryptedBoltaApiKey,
} from "./get-bolta-api-info";

interface Props {
  amount: number;
  orderName: string;
  isTaxFree: boolean;

  supplier: {
    identificationNumber: string;
    organizationName: string;
    representativeName: string;
    manager: {
      email: string;
      name: string;
      telephone: string;
    };
    address: string;
    businessType: string;
    businessItem: string;
  };

  supplied: {
    identificationNumber: string;
    organizationName: string;
    representativeName: string;
    managers: {
      email: string;
      name: string;
      telephone: string;
    }[];
    address: string;
    businessType: string;
    businessItem: string;
  };
}

export async function issueTaxInvoice({
  amount,
  orderName,
  isTaxFree,
  supplier,
  supplied,
}: Props): Promise<ServerResponse<{ issuanceKey: string }>> {
  const today = new Date().toISOString().split("T")[0];

  const url = "https://xapi.bolta.io/v1/taxInvoices/issue";
  const body: RequestTaxInvoice = {
    date: today,
    purpose: 발행목적.Receipt,
    supplier: {
      identificationNumber: supplier.identificationNumber,
      organizationName: supplier.organizationName,
      representativeName: supplier.representativeName,
      manager: {
        email: supplier.manager.email,
        name: supplier.manager.name,
        telephone: supplier.manager.telephone,
      },
      address: supplier.address,
      businessType: supplier.businessType,
      businessItem: supplier.businessItem,
    },
    supplied: {
      identificationNumber: supplied.identificationNumber,
      organizationName: supplied.organizationName,
      representativeName: supplied.representativeName,
      managers: supplied.managers.map((manager) => ({
        email: manager.email,
        name: manager.name,
        telephone: manager.telephone,
      })),
      address: supplied.address,
      businessType: supplied.businessType,
      businessItem: supplied.businessItem,
    },

    items: [
      {
        date: today,
        name: orderName,
        ...(isTaxFree
          ? {
              supplyCost: amount,
            }
          : {
              supplyCost: Math.floor(amount / 1.1),
              tax: Math.floor((amount / 1.1) * 0.1),
            }),
      },
    ],
  };

  const option = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getEncryptedBoltaApiKey(),
      "Customer-Key": getBoltaCustomerKey(),
    },
    body: JSON.stringify(body),
  };

  try {
    const response = await fetch(url, option);
    const data: ResponseTaxInvoice = await response.json();

    if (!data?.issuanceKey) {
      console.error("[issueTaxInvoice] 세금계산서 발행 실패", data);
      return {
        success: false,
        message: data?.message,
      };
    }

    console.info("[issueTaxInvoice] 세금계산서 발행 성공");
    return {
      success: true,
      data: { issuanceKey: data.issuanceKey },
    };
  } catch (e) {
    console.error("[볼타 세금계산서 발행 API ERROR]", e);
    return {
      success: false,
      message: `세금계산서 발행 실패: ${
        e instanceof Error ? e.message : "알 수 없는 오류"
      }`,
    };
  }
}
