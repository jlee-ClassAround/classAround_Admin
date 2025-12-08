import { db } from "@/lib/db";
import { Order, Payment, PaymentCancel, ProductCategory } from "@prisma/client";
import {
  buildPaymentWhereClause,
  PaymentFilterParams,
} from "./build-payment-filters";

interface GetPaymentsProps extends PaymentFilterParams {
  currentPage?: number;
  pageSize?: number;
}

export interface PaymentWithRelations extends Payment {
  order: Order & {
    user: {
      id: string;
      username: string | null;
      email: string | null;
      phone: string | null;
    } | null;
    orderItems: {
      id: string;
      productTitle: string;
      productCategory: ProductCategory;
    }[];
  };
  paymentCancels: PaymentCancel[];
}

export async function getPayments({
  currentPage = 1,
  pageSize = 50,
  ...filterParams
}: GetPaymentsProps = {}): Promise<{
  payments: PaymentWithRelations[];
  totalCount: number;
  totalPages: number;
}> {
  try {
    const whereClause = buildPaymentWhereClause(filterParams);

    const payments = await db.payment.findMany({
      where: whereClause,
      take: pageSize,
      skip: (currentPage - 1) * pageSize,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                phone: true,
              },
            },
            orderItems: {
              select: {
                id: true,
                productTitle: true,
                productCategory: true,
              },
            },
          },
        },
        paymentCancels: true,
      },
    });

    const totalCount = await db.payment.count({
      where: whereClause,
    });
    const totalPages = Math.ceil(totalCount / pageSize);

    return { payments, totalCount, totalPages };
  } catch (error) {
    console.error("[GET_PAYMENTS_ERROR]", error);
    return { payments: [], totalCount: 0, totalPages: 0 };
  }
}
