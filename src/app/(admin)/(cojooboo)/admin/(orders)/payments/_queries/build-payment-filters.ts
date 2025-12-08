import {
  PaymentMethod,
  PaymentStatus,
  ProductCategory,
  Prisma,
} from "@prisma/client";

export interface PaymentFilterParams {
  search?: string;
  productCategory?: ProductCategory | "ALL";
  paymentMethod?: PaymentMethod | "ALL";
  taxFree?: string | "ALL";
  paymentStatus?: PaymentStatus | "ALL";
  dateFrom?: string;
  dateTo?: string;
}

export function buildPaymentWhereClause({
  search,
  productCategory,
  paymentMethod,
  taxFree,
  paymentStatus,
  dateFrom,
  dateTo,
}: PaymentFilterParams = {}): Prisma.PaymentWhereInput {
  const whereClause: Prisma.PaymentWhereInput = {};
  const andConditions: Prisma.PaymentWhereInput[] = [];

  // 검색 필터 (구매자 정보, 결제키)
  if (search) {
    whereClause.OR = [
      {
        order: {
          user: {
            username: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      },
      {
        order: {
          user: {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      },
      {
        order: {
          user: {
            phone: {
              contains: search,
            },
          },
        },
      },
      {
        tossPaymentKey: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  // 상품유형 필터
  if (productCategory && productCategory !== "ALL") {
    andConditions.push({
      order: {
        orderItems: {
          some: {
            productCategory,
          },
        },
      },
    });
  }

  // 결제수단 필터
  if (paymentMethod && paymentMethod !== "ALL") {
    andConditions.push({
      paymentMethod,
    });
  }

  // 면세여부 필터
  if (taxFree && taxFree !== "ALL") {
    andConditions.push({
      isTaxFree: taxFree === "true",
    });
  }

  // 결제상태 필터
  if (paymentStatus && paymentStatus !== "ALL") {
    andConditions.push({
      paymentStatus,
    });
  }

  // 결제일시 필터
  if (dateFrom || dateTo) {
    const dateFilter: Prisma.PaymentWhereInput["createdAt"] = {};
    if (dateFrom) {
      dateFilter.gte = new Date(dateFrom);
    }
    if (dateTo) {
      dateFilter.lte = new Date(dateTo);
    }
    andConditions.push({
      createdAt: dateFilter,
    });
  }

  // AND 조건이 있으면 추가
  if (andConditions.length > 0) {
    whereClause.AND = andConditions;
  }

  return whereClause;
}
