"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/utils/formats";

interface PaymentStatsProps {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    courseRevenue: number;
    ebookRevenue: number;
    couponUsageCount: number;
    totalDiscountAmount: number;
    totalRefundAmount: number;
  };
}

export function PaymentStats({ stats }: PaymentStatsProps) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">총 매출</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPrice(stats.totalRevenue)}원
          </div>
          <p className="text-xs text-muted-foreground">
            총 {stats.totalOrders}건
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">강의 매출</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPrice(stats.courseRevenue)}원
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">전자책 매출</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPrice(stats.ebookRevenue)}원
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">쿠폰 사용</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.couponUsageCount}건</div>
          <p className="text-xs text-muted-foreground">
            할인 금액: {formatPrice(stats.totalDiscountAmount)}원
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">환불 금액</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPrice(stats.totalRefundAmount)}원
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
