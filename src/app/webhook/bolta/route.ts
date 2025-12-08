import { db } from "@/lib/db";
import { TaxInvoiceWebhookEvent } from "@/external-api/bolta/types/tax-invoice-types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body: TaxInvoiceWebhookEvent = await request.json();
    console.log("[bolta webhook] body", body);

    if (body.eventType === "TAX_INVOICE_ISSUANCE_SUCCESS") {
      const { issuanceKey, taxInvoiceUrl } = body.data;

      const taxInvoiceData = await db.taxInvoiceHistory.findFirst({
        where: {
          issuanceKey: issuanceKey,
        },
      });

      if (!taxInvoiceData) {
        return NextResponse.json(
          { message: "tax invoice not found" },
          { status: 404 }
        );
      }

      if (taxInvoiceData.status === "ISSUANCE_REQUESTED") {
        await db.taxInvoiceHistory.create({
          data: {
            issuanceKey,
            status: "ISSUED",
            taxInvoiceUrl,
            paymentId: taxInvoiceData.paymentId,
            amount: taxInvoiceData.amount,
          },
        });
      }
      if (taxInvoiceData.status === "CANCEL_REQUESTED") {
        await db.taxInvoiceHistory.create({
          data: {
            issuanceKey,
            status: "CANCELED",
            taxInvoiceUrl,
            paymentId: taxInvoiceData.paymentId,
            amount: taxInvoiceData.amount,
          },
        });
      }
    }

    console.log("[bolta webhook] success");
    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (error) {
    console.error("[bolta webhook] error", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
