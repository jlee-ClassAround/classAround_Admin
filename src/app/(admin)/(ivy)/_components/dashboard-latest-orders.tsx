"use client";

import { dateTimeFormat } from "@/utils/formats";
import Link from "next/link";

interface DashboardLatestOrdersProps {
  orders: any[];
}

export function DashboardLatestOrders({ orders }: DashboardLatestOrdersProps) {
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="flex items-center justify-between border-b pb-4"
        >
          <div className="space-y-1">
            <Link
              href={`/admin/users/${order.userId}`}
              className="text-sm font-medium hover:underline"
            >
              {order.user?.username || "알 수 없음"}
            </Link>
            <p className="text-sm text-muted-foreground">{order.orderName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">
              {new Intl.NumberFormat("ko-KR", {
                style: "currency",
                currency: "KRW",
              }).format(order.finalPrice)}
            </p>
            <p className="text-xs text-muted-foreground">
              {dateTimeFormat(order.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
