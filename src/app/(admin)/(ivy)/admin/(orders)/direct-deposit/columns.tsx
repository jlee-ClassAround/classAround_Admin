"use client";

import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { dateTimeFormat, formatPrice } from "@/utils/formats";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { approveDirectDeposit } from "./_actions/approve-direct-deposit";
import ApproveModal from "./_components/approve-modal";
import { CancelModal } from "./_components/cancel-modal";
import { UserInfoTable } from "./_components/user-info-table";
import { DirectDepositTransaction } from "./_queries/get-direct-deposit-transactions";
import { getBillingTypeToKr } from "@/utils/payments/get-enum-to-kr";
import { getProductCategoryToKr } from "@/utils/products/get-enum-to-kr";

export const columns: ColumnDef<DirectDepositTransaction>[] = [
  {
    accessorKey: "payment.course.title",
    meta: {
      label: "구매상품",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={"구매상품"} />
    ),
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="max-w-[300px] truncate text-xs">
          {data.payment.order.orderItems
            .map((item) => item.course?.title || item.ebook?.title)
            .join(", ")}
        </div>
      );
    },
  },
  {
    accessorKey: "payment.profile.username",
    meta: {
      label: "구매자",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="구매자" />
    ),
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="truncate text-xs">
          {data.payment.order.user?.username || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "payment.profile.phone",
    meta: {
      label: "전화번호",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="전화번호" />
    ),
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="truncate text-xs">
          {data.payment.order.user?.phone || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "payment.profile.email",
    meta: {
      label: "이메일",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="이메일" />
    ),
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="truncate text-xs">
          {data.payment.order.user?.email || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "payment.productType",
    meta: {
      label: "상품 유형",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="상품 유형" />
    ),
    cell: ({ row }) => {
      const data = row.original;
      return (
        <Badge variant="secondary">
          {getProductCategoryToKr(
            data.payment.order.orderItems[0].productCategory
          )}
        </Badge>
      );
    },
  },
  {
    accessorKey: "payment.finalPrice",
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
          {formatPrice(data.payment.amount)}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    meta: {
      label: "요청일",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="요청일" />
    ),
    cell: ({ row }) => (
      <div className="text-end text-xs truncate">
        {dateTimeFormat(row.original.createdAt)}
      </div>
    ),
  },
  {
    accessorKey: "method",
    meta: {
      label: "결제 방법",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="결제 방법" />
    ),
    cell: ({ row }) => {
      const data = row.original;
      let label;
      switch (data.method) {
        case "DIRECT_DEPOSIT":
          label = "직접 계좌이체";
          break;
        case "CARD":
          label = "카드";
          break;
        case "TRANSFER":
          label = "퀵계좌이체";
          break;
        case "VIRTUAL_ACCOUNT":
          label = "가상계좌";
          break;
      }

      return (
        <Badge variant="secondary" className="truncate">
          {label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    meta: {
      label: "결제 상태",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="결제 상태" />
    ),
    cell: ({ row }) => {
      const data = row.original;
      const status = data.status;
      let label = "결제완료";
      let style = "text-green-500 bg-green-500/10";

      switch (status) {
        case "WAITING_FOR_DIRECT_DEPOSIT":
          label = "입금대기";
          style = "text-muted-foreground bg-muted-foreground/10";
          break;
        case "CANCELED":
          label = "취소됨";
          style = "text-red-500 bg-red-500/10";
          break;
        case "PARTIAL_CANCELED":
          label = "부분취소";
          style = "text-red-500 bg-red-500/10";
          break;
        case "DONE":
          label = "결제완료";
          style = "text-green-500 bg-green-500/10";
          break;
      }

      return (
        <Badge variant="secondary" className={cn("", style)}>
          {label}
        </Badge>
      );
    },
  },
  {
    id: "info",
    meta: {
      label: "상세정보",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="상세정보" />
    ),
    cell: ({ row }) => <InfoAction row={row} />,
  },
  {
    id: "approve",
    meta: {
      label: "승인",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="승인하기" />
    ),
    cell: ({ row }) => <ApproveAction row={row} />,
  },
  {
    accessorKey: "payment.billingSnapshot.billingType",
    meta: {
      label: "청구서 유형",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="청구서 유형" />
    ),
    cell: ({ row }) => {
      const data = row.original;
      const billingType = data.payment.billingSnapshot?.billingType;
      return (
        <Badge variant="secondary">
          {getBillingTypeToKr(billingType || null)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "taxInvoiceHistories.issuanceKey",
    meta: {
      label: "세금계산서 발행 id",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="세금계산서 발행 id" />
    ),
    cell: ({ row }) => {
      const data = row.original;
      const key = data.payment.taxInvoiceHistories?.[0]?.issuanceKey;
      return (
        <div className="flex items-center gap-x-2">
          <div className="max-w-[120px] truncate text-xs text-center w-full text-foreground/50">
            {key || "-"}
          </div>
          {key && (
            <Copy
              className="size-3 cursor-pointer hover:text-muted-foreground"
              onClick={() => {
                navigator.clipboard.writeText(key);
                toast.info(`세금계산서 발행 id가 복사되었습니다. ID: ${key}`);
              }}
            />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "cashReceiptHistories.issueNumber",
    meta: {
      label: "현금영수증 발행번호",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="현금영수증 발행번호" />
    ),
    cell: ({ row }) => {
      const data = row.original;
      const issueNumber = data.payment.cashReceiptHistories?.[0]?.issueNumber;
      return (
        <div className="flex items-center gap-x-2 justify-center">
          <div className="max-w-[80px] truncate text-xs text-foreground/50 w-full text-center">
            {issueNumber || "-"}
          </div>
          {issueNumber && (
            <Copy
              className="size-3 cursor-pointer hover:text-muted-foreground"
              onClick={() => {
                navigator.clipboard.writeText(issueNumber);
                toast.info(
                  `현금영수증 발행번호가 복사되었습니다. 번호: ${issueNumber}`
                );
              }}
            />
          )}
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
      <DataTableColumnHeader column={column} title="취소하기" />
    ),
    cell: ({ row }) => <CancelAction row={row} />,
  },
  {
    accessorKey: "cancelAmount",
    meta: {
      label: "취소 금액",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="취소 금액" />
    ),
    cell: ({ row }) => {
      const data = row.original.payment.cancelAmount;
      if (data) {
        return (
          <div className="text-end text-xs truncate">{formatPrice(data)}</div>
        );
      }
      return null;
    },
  },
  {
    accessorKey: "cashReceiptHistories.receiptUrl",
    meta: {
      label: "현금영수증 상세",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="현금영수증 상세" />
    ),
    cell: ({ row }) => {
      let receiptUrl = null;
      if (row.original.status === "DONE") {
        receiptUrl = row.original.payment.cashReceiptHistories?.find(
          (item) => item.status === "ISSUED"
        )?.receiptUrl;
      }
      if (
        row.original.status === "CANCELED" ||
        row.original.status === "PARTIAL_CANCELED"
      ) {
        receiptUrl = row.original.payment.cashReceiptHistories?.find(
          (item) =>
            item.status === "CANCELED" || item.status === "PARTIAL_CANCELED"
        )?.receiptUrl;
      }
      if (receiptUrl) {
        return (
          <a href={receiptUrl} target="_blank" className="text-xs underline">
            현금영수증 상세
          </a>
        );
      }
      return null;
    },
  },
  {
    accessorKey: "taxInvoiceHistories.taxInvoiceUrl",
    meta: {
      label: "세금계산서 상세",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="세금계산서 상세" />
    ),
    cell: ({ row, column }) => {
      const data = row.original;
      const taxInvoiceHistories = data.payment.taxInvoiceHistories;

      if (data.status === "DONE") {
        const issuedHistory = taxInvoiceHistories.find(
          (item) => item.status === "ISSUED"
        );
        if (issuedHistory?.taxInvoiceUrl) {
          return (
            <a
              href={issuedHistory.taxInvoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/75 hover:text-foreground underline text-xs"
            >
              세금계산서 보기
            </a>
          );
        }
      }

      if (data.status === "CANCELED") {
        const canceledHistory = taxInvoiceHistories.find(
          (item) => item.status === "CANCELED"
        );
        if (canceledHistory?.taxInvoiceUrl) {
          return (
            <a
              href={canceledHistory.taxInvoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/75 hover:text-foreground underline text-xs"
            >
              취소 세금계산서 보기
            </a>
          );
        }
      }

      if (data.status === "PARTIAL_CANCELED") {
        const canceledHistories = taxInvoiceHistories
          .filter((item) => item.status === "CANCELED")
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

        if (canceledHistories && canceledHistories.length > 0) {
          return (
            <div className="space-y-1">
              <div className="text-xs font-medium truncate">
                취소 세금계산서 ({canceledHistories.length}건)
              </div>
              {canceledHistories.map((history, index) => (
                <div key={history.id} className="text-xs truncate">
                  <a
                    href={history.taxInvoiceUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground/75 hover:text-foreground underline"
                  >
                    {index + 1}차 취소 세금계산서
                  </a>
                  <span className="text-foreground/50 ml-2">
                    {new Date(history.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          );
        }
      }

      return "-";
    },
  },
];

function InfoAction({ row }: { row: Row<DirectDepositTransaction> }) {
  const [open, setOpen] = useState(false);
  const data = row.original;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="text-xs text-muted-foreground hover:underline cursor-pointer"
          onClick={() => setOpen(true)}
        >
          상세정보
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="space-y-4">
        <div className="overflow-y-auto max-h-[80vh] space-y-5">
          <AlertDialogHeader>
            <AlertDialogTitle>상세정보</AlertDialogTitle>
          </AlertDialogHeader>
          <UserInfoTable
            billingSnapshot={data.payment.billingSnapshot || null}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>닫기</AlertDialogCancel>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ApproveAction({ row }: { row: Row<DirectDepositTransaction> }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const data = row.original;

  if (data.payment.paymentStatus !== "WAITING_FOR_DIRECT_DEPOSIT") return null;

  const handleApprove = async () => {
    try {
      setIsLoading(true);
      const result = await approveDirectDeposit(
        data.payment.order.id,
        data.payment.id,
        data.payment.order.userId || "",
        data.payment.order.orderItems[0].productId
      );

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success("승인 처리 완료");
      router.refresh();
    } catch {
      toast.error("승인 처리 실패");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ApproveModal
      isLoading={isLoading}
      handleApprove={handleApprove}
      billingType={data.payment.billingSnapshot?.billingType || null}
    />
  );
}

function CancelAction({ row }: { row: Row<DirectDepositTransaction> }) {
  const data = row.original;
  const canCancel =
    data.payment.paymentStatus === "DONE" ||
    data.payment.paymentStatus === "PARTIAL_CANCELED";
  if (!canCancel) return "-";

  const isTaxInvoiceIssued = Boolean(
    data.payment.taxInvoiceHistories?.find((item) => item.status === "ISSUED")
  );
  if (
    data.payment.billingSnapshot?.billingType === "TAX_INVOICE" &&
    !isTaxInvoiceIssued
  )
    return "-";

  return (
    <CancelModal
      orderId={data.payment.order.id}
      buyerName={data.payment.order.user?.username || ""}
      productName={
        data.payment.order.orderItems
          .map((item) => item.productTitle)
          .join(", ") || ""
      }
      paymentDate={dateTimeFormat(data.payment.createdAt)}
      paymentId={data.payment.id}
      userId={data.payment.order.userId || ""}
      productId={data.payment.order.orderItems[0].productId}
      cancelableAmount={data.payment.refundableAmount || data.payment.amount}
    />
  );
}
