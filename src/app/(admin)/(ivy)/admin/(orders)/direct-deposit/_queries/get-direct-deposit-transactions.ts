import { db } from "@/lib/db";
import {
  Transaction,
  Payment,
  Order,
  OrderItem,
  BillingSnapshot,
  TaxInvoiceHistory,
  CashReceiptHistory,
} from "@prisma/client";

export interface DirectDepositTransaction extends Transaction {
  payment: Payment & {
    order: Order & {
      user: {
        username: string | null;
        phone: string | null;
        email: string | null;
      } | null;
      orderItems: (OrderItem & {
        course: {
          title: string;
        } | null;
        ebook: {
          title: string;
        } | null;
      })[];
    };
    billingSnapshot: BillingSnapshot | null;
    taxInvoiceHistories: TaxInvoiceHistory[];
    cashReceiptHistories: CashReceiptHistory[];
  };
}

export async function getDirectDepositTransactions(): Promise<
  DirectDepositTransaction[]
> {
  const transactions = await db.transaction.findMany({
    where: {
      method: "DIRECT_DEPOSIT",
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      payment: {
        include: {
          order: {
            include: {
              user: {
                select: {
                  username: true,
                  phone: true,
                  email: true,
                },
              },
              orderItems: {
                include: {
                  course: {
                    select: {
                      title: true,
                    },
                  },
                  ebook: {
                    select: {
                      title: true,
                    },
                  },
                },
              },
            },
          },
          billingSnapshot: true,
          taxInvoiceHistories: {
            orderBy: {
              createdAt: "desc",
            },
          },
          cashReceiptHistories: true,
        },
      },
    },
  });

  return transactions;
}
