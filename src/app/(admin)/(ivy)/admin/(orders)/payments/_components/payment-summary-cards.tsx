import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/utils/formats";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BanknoteIcon,
  CreditCardIcon,
  TrendingUpIcon,
  XCircleIcon,
} from "lucide-react";
import { PaymentSummary } from "../_queries/get-payment-summary";
import { cn } from "@/lib/utils";

interface PaymentSummaryCardsProps {
  summary: PaymentSummary;
}

export function PaymentSummaryCards({ summary }: PaymentSummaryCardsProps) {
  const isRevenueIncreased = summary.revenueChangeRate >= 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* 이번 달 매출 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">이번 달 매출</CardTitle>
          <BanknoteIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPrice(summary.currentMonthRevenue)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            총 {summary.totalTransactions.toLocaleString()}건
          </p>
        </CardContent>
      </Card>

      {/* 저번 달 매출 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">저번 달 매출</CardTitle>
          <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPrice(summary.previousMonthRevenue)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">전월 실적</p>
        </CardContent>
      </Card>

      {/* 매출 증감률 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">전월 대비</CardTitle>
          <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              {Math.abs(summary.revenueChangeRate).toFixed(1)}%
            </span>
            {isRevenueIncreased ? (
              <ArrowUpIcon className="h-5 w-5 text-green-500" />
            ) : (
              <ArrowDownIcon className="h-5 w-5 text-red-500" />
            )}
          </div>
          <p
            className={cn(
              "text-xs mt-1",
              isRevenueIncreased ? "text-green-600" : "text-red-600"
            )}
          >
            {isRevenueIncreased ? "상승" : "하락"}
          </p>
        </CardContent>
      </Card>

      {/* 이번 달 환불 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">이번 달 환불</CardTitle>
          <XCircleIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPrice(summary.refundAmount)}
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-muted-foreground">
              총 {summary.totalRefunds.toLocaleString()}건
            </p>
            <p className="text-xs text-muted-foreground">
              {summary.refundRate.toFixed(1)}%
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
