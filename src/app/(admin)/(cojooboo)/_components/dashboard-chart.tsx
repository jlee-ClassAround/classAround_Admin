"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { TossCustomer } from "@prisma/client";

interface DashboardChartProps {
  orders: TossCustomer[];
}

const chartConfig = {
  revenue: {
    label: "결제",
    color: "hsl(var(--chart-1))",
  },
  refund: {
    label: "환불",
    color: "hsl(var(--destructive))",
  },
  netIncome: {
    label: "매출",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function DashboardChart({ orders }: DashboardChartProps) {
  // 월별 데이터 집계
  const monthlyData = orders.reduce(
    (acc, order) => {
      const month = new Date(order.createdAt).getMonth();
      if (!acc[month]) {
        acc[month] = {
          revenue: 0,
          refund: 0,
          netIncome: 0,
        };
      }

      // 총매출 계산
      acc[month].revenue += order.finalPrice;

      // 환불액 계산
      if (order.cancelAmount) {
        acc[month].refund += order.cancelAmount;
      }

      // 순이익 계산 (매출 - 환불액)
      acc[month].netIncome = acc[month].revenue - acc[month].refund;

      return acc;
    },
    {} as Record<
      number,
      {
        revenue: number;
        refund: number;
        netIncome: number;
      }
    >
  );

  // 차트 데이터 포맷팅
  const chartData = Array.from({ length: 12 }, (_, i) => ({
    month: `${i + 1}월`,
    revenue: monthlyData[i]?.revenue || 0,
    refund: monthlyData[i]?.refund || 0,
    netIncome: monthlyData[i]?.netIncome || 0,
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>월별 매출 현황</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    const formattedValue = formatCurrency(value as number);
                    switch (name) {
                      case "revenue":
                        return ["결제 ", formattedValue];
                      case "refund":
                        return ["환불 ", formattedValue];
                      case "netIncome":
                        return ["매출 ", formattedValue];
                      default:
                        return [name, formattedValue];
                    }
                  }}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="revenue"
              fill="var(--color-revenue)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="refund"
              fill="var(--color-refund)"
              radius={[4, 4, 0, 0]}
            />
            <Bar dataKey="netIncome" fill="green" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
