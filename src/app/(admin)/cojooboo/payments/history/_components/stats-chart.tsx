"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPrice } from "@/utils/formats";

interface StatsChartProps {
  data: {
    date: string;
    revenue: number;
    orders: number;
  }[];
}

export function StatsChart({ data }: StatsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>매출 추이</CardTitle>
        <CardDescription>선택한 기간의 일별 매출과 주문 수</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis
                yAxisId="left"
                orientation="left"
                tickFormatter={(value) => formatPrice(value)}
              />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value: any, name: string) => {
                  if (name === "revenue") {
                    return [formatPrice(value) + "원", "매출"];
                  }
                  return [value + "건", "주문 수"];
                }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
