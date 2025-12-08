"use client";

import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { dateTimeFormat, formatPrice } from "@/utils/formats";
import { getPaymentMethodToKr } from "@/utils/payments/get-enum-to-kr";
import { TossCustomer } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { RefundAction } from "./_components/refund-action";
import { AdminCopyButton } from "@/app/(admin)/_components/admin-copy-button";

interface ExtendedTossCustomer extends TossCustomer {
  course?: { title: string } | null;
  ebook?: { title: string } | null;
  user?: { username: string; phone: string; email: string } | null;
}

export const columns: ColumnDef<ExtendedTossCustomer>[] = [
  {
    accessorKey: "orderId",
    meta: {
      label: "주문ID",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="주문ID" />
    ),
    cell: ({ row }) => {
      const data = row.original;
      return (
        <AdminCopyButton
          copyText={data.orderId}
          successMessage="주문ID가 복사되었습니다."
          className="max-w-[120px] truncate text-xs"
        />
      );
    },
  },
  // {
  //   accessorKey: "orderName",
  //   meta: {
  //     label: "주문명",
  //   },
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="주문명" />
  //   ),
  //   cell: ({ row }) => {
  //     const data = row.original;
  //     return (
  //       <div className="max-w-[300px] truncate text-xs">
  //         {data.orderName || "-"}
  //       </div>
  //     );
  //   },
  // },
  {
    accessorKey: "course.title",
    meta: {
      label: "상품명",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={"상품명"} />
    ),
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="max-w-[300px] truncate text-xs">
          {data.course?.title || data.ebook?.title || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "user.username",
    meta: {
      label: "구매자",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="구매자" />
    ),
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="truncate text-xs">{data.user?.username || "-"}</div>
      );
    },
  },
  {
    accessorKey: "user.phone",
    meta: {
      label: "전화번호",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="전화번호" />
    ),
    cell: ({ row }) => {
      const data = row.original;
      return <div className="truncate text-xs">{data.user?.phone || "-"}</div>;
    },
  },
  {
    accessorKey: "user.email",
    meta: {
      label: "이메일",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="이메일" />
    ),
    cell: ({ row }) => {
      const data = row.original;
      return <div className="truncate text-xs">{data.user?.email || "-"}</div>;
    },
  },
  {
    accessorKey: "productType",
    meta: {
      label: "상품 유형",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="상품 유형" />
    ),
    cell: ({ row }) => {
      const data = row.original;
      return (
        <Badge
          variant={data.productType === "COURSE" ? "default" : "secondary"}
        >
          {data.productType === "COURSE" ? "강의" : "전자책"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isTaxFree",
    meta: {
      label: "세금 유형",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="세금 유형" />
    ),
    cell: ({ row }) => {
      const data = row.original;
      return (
        <Badge variant={"secondary"} className="rounded-full">
          {data.isTaxFree ? "면세" : "과세"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "paymentMethod",
    meta: {
      label: "결제 수단",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="결제 수단" />
    ),
    cell: ({ row }) => {
      const data = row.original;
      return (
        <Badge variant="secondary">
          {getPaymentMethodToKr(data.paymentMethod)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "finalPrice",
    meta: {
      label: "결제 금액",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="결제 금액" />
    ),
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="text-end text-xs truncate font-medium">
          {formatPrice(data.finalPrice)}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    meta: {
      label: "결제일",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="결제일" />
    ),
    cell: ({ row }) => (
      <div className="text-end text-xs truncate">
        {dateTimeFormat(row.original.createdAt)}
      </div>
    ),
  },
  {
    accessorKey: "paymentStatus",
    meta: {
      label: "결제 상태",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="결제 상태" />
    ),
    cell: ({ row }) => {
      const data = row.original;
      const status = data.paymentStatus;
      let label = "결제대기";
      let style = "text-gray-500 bg-gray-500/10";

      switch (status) {
        case "CANCELLED":
          label = "취소됨";
          style = "text-muted-foreground bg-muted-foreground/10";
          break;
        case "REFUNDED":
          label = "환불됨";
          style = "text-red-500 bg-red-500/10";
          break;
        case "PARTIAL_REFUNDED":
          label = "부분환불";
          style = "text-red-500 bg-red-500/10";
          break;
        case "COMPLETED":
          label = "결제완료";
          style = "text-green-500 bg-green-500/10";
          break;
      }

      return (
        <Badge variant="secondary" className={cn("rounded-full", style)}>
          {label}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    meta: {
      label: "환불",
    },
    cell: ({ row }) => <RefundAction row={row} />,
  },
  {
    accessorKey: "cancelAmount",
    meta: {
      label: "환불 금액",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="환불 금액" />
    ),
    cell: ({ row }) => {
      const data = row.original.cancelAmount;
      if (data) {
        return (
          <div className="text-end text-xs truncate">{formatPrice(data)}</div>
        );
      }
      return null;
    },
  },
  {
    accessorKey: "receiptUrl",
    meta: {
      label: "영수증",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="영수증" />
    ),
    cell: ({ row }) => {
      const data = row.original.receiptUrl;
      if (data) {
        return (
          <a
            href={`${data}`}
            target="_blank"
            className="text-xs hover:text-primary underline"
          >
            영수증 보기
          </a>
        );
      }
      return null;
    },
  },
];
