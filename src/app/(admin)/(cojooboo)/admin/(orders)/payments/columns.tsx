"use client";

import { AdminCopyButton } from "@/app/(admin)/_components/admin-copy-button";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { dateTimeFormat, formatPrice } from "@/utils/formats";
import {
  getOrderTypeToKr,
  getPaymentMethodToKr,
  getPaymentStatusToKr,
} from "@/utils/payments/get-enum-to-kr";
import { getProductCategoryToKr } from "@/utils/products/get-enum-to-kr";
import { ColumnDef } from "@tanstack/react-table";
import { PaymentWithRelations } from "./_queries/get-payments";
import { CancelAction } from "./_components/cancel-action";

export const columns: ColumnDef<PaymentWithRelations>[] = [
  {
    accessorKey: "id",
    meta: {
      label: "결제ID",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="결제ID" />
    ),
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <AdminCopyButton
          copyText={id}
          successMessage="결제 ID가 복사되었습니다."
          className="max-w-[120px]"
        />
      );
    },
  },
  {
    accessorKey: "order.orderItems.productTitle",
    meta: {
      label: "상품명",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="상품명" />
    ),
    cell: ({ row }) => {
      const items = row.original.order.orderItems;
      return (
        <div className="text-xs truncate max-w-[200px]">
          {items[0].productTitle || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "order.user.username",
    meta: {
      label: "구매자",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="구매자" />
    ),
    cell: ({ row }) => {
      const user = row.original.order.user;
      return (
        <AdminCopyButton
          copyText={user?.username}
          successMessage="구매자가 복사되었습니다."
        />
      );
    },
  },
  {
    accessorKey: "order.user.email",
    meta: {
      label: "이메일",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="이메일" />
    ),
    cell: ({ row }) => {
      const user = row.original.order.user;
      return (
        <AdminCopyButton
          copyText={user?.email}
          successMessage="이메일이 복사되었습니다."
        />
      );
    },
  },
  {
    accessorKey: "order.user.phone",
    meta: {
      label: "전화번호",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="전화번호" />
    ),
    cell: ({ row }) => {
      const user = row.original.order.user;
      return (
        <AdminCopyButton
          copyText={user?.phone}
          successMessage="전화번호가 복사되었습니다."
        />
      );
    },
  },
  {
    accessorKey: "order.orderItems.productCategory",
    meta: {
      label: "상품유형",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="상품유형" />
    ),
    cell: ({ row }) => {
      const productCategory = row.original.order.orderItems[0].productCategory;
      return (
        <Badge variant="secondary" className="truncate">
          {getProductCategoryToKr(productCategory)}
        </Badge>
      );
    },
  },
  // {
  //   accessorKey: "order.type",
  //   meta: {
  //     label: "결제유형",
  //   },
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="결제유형" />
  //   ),
  //   cell: ({ row }) => {
  //     return (
  //       <Badge variant="secondary" className="truncate">
  //         {getOrderTypeToKr(row.original.order.type)}
  //       </Badge>
  //     );
  //   },
  // },
  {
    accessorKey: "paymentMethod",
    meta: {
      label: "결제수단",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="결제수단" />
    ),
    cell: ({ row }) => {
      return (
        <Badge variant="secondary" className="truncate">
          {getPaymentMethodToKr(row.original.paymentMethod)}
        </Badge>
      );
    },
  },

  {
    accessorKey: "isTaxFree",
    meta: {
      label: "면세여부",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="면세여부" />
    ),
    cell: ({ row }) => {
      const isTaxFree = row.original.isTaxFree;
      return <Badge variant="secondary">{isTaxFree ? "면세" : "과세"}</Badge>;
    },
  },
  {
    accessorKey: "paymentStatus",
    meta: {
      label: "결제상태",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="결제상태" />
    ),
    cell: ({ row }) => {
      const status = row.original.paymentStatus;
      let style = "";

      switch (status) {
        case "DONE":
          style = "bg-green-500/10 text-green-500";
          break;
        case "CANCELED":
          style = "bg-red-500/10 text-red-500";
        case "FAILED":
          style = "bg-red-500/10 text-red-500";
          break;
        case "PARTIAL_CANCELED":
          style = "bg-red-500/10 text-red-500";
          break;
        default:
          style = "bg-gray-500/10 text-gray-500";
          break;
      }

      return (
        <Badge variant="secondary" className={cn(style)}>
          {getPaymentStatusToKr(status)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "amount",
    meta: {
      label: "결제금액",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="결제금액" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-xs text-end font-semibold">
          {formatPrice(row.original.amount)}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    meta: {
      label: "결제일시",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="결제일시" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-xs truncate text-muted-foreground">
          {dateTimeFormat(row.original.createdAt)}
        </div>
      );
    },
  },
  {
    id: "cancel",
    meta: {
      label: "취소",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="취소" />
    ),
    cell: ({ row }) => {
      return <CancelAction row={row} />;
    },
  },
  {
    accessorKey: "cancelAmount",
    meta: {
      label: "취소금액",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="취소금액" />
    ),
    cell: ({ row }) => {
      const cancelAmount = row.original.cancelAmount;
      return (
        <div className="text-xs text-end text-red-500">
          {cancelAmount ? formatPrice(cancelAmount) : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "tossPaymentKey",
    meta: {
      label: "토스결제키",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="토스결제키" />
    ),
    cell: ({ row }) => {
      const paymentKey = row.original.tossPaymentKey;
      if (!paymentKey) {
        return <span className="text-xs text-muted-foreground">-</span>;
      }
      return (
        <AdminCopyButton
          copyText={paymentKey}
          successMessage="결제키가 복사되었습니다."
          className="max-w-[150px]"
        />
      );
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
      const receiptUrl = row.original.receiptUrl;
      if (!receiptUrl) {
        return <span className="text-xs text-muted-foreground">-</span>;
      }
      return (
        <a
          href={receiptUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs underline text-muted-foreground hover:text-foreground transition-colors"
        >
          영수증 보기
        </a>
      );
    },
  },
];
