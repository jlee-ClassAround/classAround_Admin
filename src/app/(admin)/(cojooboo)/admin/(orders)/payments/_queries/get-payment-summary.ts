import { db } from "@/lib/db";
import { PaymentStatus } from "@prisma/client";
import {
  buildPaymentWhereClause,
  PaymentFilterParams,
} from "./build-payment-filters";

export interface PaymentSummary {
  currentMonthRevenue: number;
  previousMonthRevenue: number;
  revenueChangeRate: number;
  refundAmount: number;
  refundRate: number;
  totalTransactions: number;
  totalRefunds: number;
}

interface GetPaymentSummaryProps extends PaymentFilterParams {}

export async function getPaymentSummary(
  filterParams: GetPaymentSummaryProps = {}
): Promise<PaymentSummary> {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const previousMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999
    );

    // 날짜 필터가 있으면 해당 기간 사용, 없으면 이번 달 사용
    const { dateFrom, dateTo } = filterParams;
    const dateFilter =
      dateFrom || dateTo
        ? {
            gte: dateFrom ? new Date(dateFrom) : undefined,
            lte: dateTo ? new Date(dateTo) : undefined,
          }
        : { gte: currentMonthStart };

    // 이번 달 매출 (DONE 상태) - 필터링 적용
    const currentMonthPayments = await db.payment.aggregate({
      where: {
        ...buildPaymentWhereClause({ ...filterParams, dateFrom, dateTo }),
        paymentStatus: PaymentStatus.DONE,
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // 저번 달 매출 (DONE 상태) - 필터링 적용 (날짜 필터가 없을 때만)
    const previousMonthPayments = await db.payment.aggregate({
      where: {
        ...buildPaymentWhereClause({
          ...filterParams,
          dateFrom: previousMonthStart.toISOString().split("T")[0],
          dateTo: previousMonthEnd.toISOString().split("T")[0],
        }),
        paymentStatus: PaymentStatus.DONE,
      },
      _sum: {
        amount: true,
      },
    });

    // 전체 결제 건수 (모든 상태 포함) - 필터링 적용
    const currentMonthAllPayments = await db.payment.count({
      where: buildPaymentWhereClause({ ...filterParams, dateFrom, dateTo }),
    });

    // 환불 데이터 (PaymentCancel 테이블에서 집계) - 필터링 적용
    const currentMonthRefunds = await db.paymentCancel.aggregate({
      where: {
        payment: buildPaymentWhereClause({ ...filterParams, dateFrom, dateTo }),
        cancelStatus: "DONE",
      },
      _sum: {
        cancelAmount: true,
      },
      _count: true,
    });

    // 환불이 있는 유니크 결제 건수 - 필터링 적용
    const currentMonthRefundedPayments = await db.payment.count({
      where: {
        ...buildPaymentWhereClause({ ...filterParams, dateFrom, dateTo }),
        paymentCancels: {
          some: {
            cancelStatus: "DONE",
          },
        },
      },
    });

    const currentMonthRevenue = currentMonthPayments._sum.amount || 0;
    const previousMonthRevenue = previousMonthPayments._sum.amount || 0;
    const refundAmount = currentMonthRefunds._sum.cancelAmount || 0;
    const totalTransactions = currentMonthPayments._count;
    const totalRefunds = currentMonthRefundedPayments; // 환불된 결제 건수

    // 매출 증감률 계산
    const revenueChangeRate =
      previousMonthRevenue > 0
        ? ((currentMonthRevenue - previousMonthRevenue) /
            previousMonthRevenue) *
          100
        : currentMonthRevenue > 0
        ? 100
        : 0;

    // 환불률 계산 (이번 달 생성된 결제 중 환불된 결제 비율)
    const refundRate =
      currentMonthAllPayments > 0
        ? (currentMonthRefundedPayments / currentMonthAllPayments) * 100
        : 0;

    return {
      currentMonthRevenue,
      previousMonthRevenue,
      revenueChangeRate,
      refundAmount,
      refundRate,
      totalTransactions,
      totalRefunds,
    };
  } catch (error) {
    console.error("[GET_PAYMENT_SUMMARY_ERROR]", error);
    return {
      currentMonthRevenue: 0,
      previousMonthRevenue: 0,
      revenueChangeRate: 0,
      refundAmount: 0,
      refundRate: 0,
      totalTransactions: 0,
      totalRefunds: 0,
    };
  }
}
