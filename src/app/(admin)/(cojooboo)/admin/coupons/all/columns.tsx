"use client";

import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { dateTimeFormat, formatPrice } from "@/utils/formats";
import { Coupon } from "@prisma/client";
import { ColumnDef, Row, Table } from "@tanstack/react-table";
import axios from "axios";
import { Copy, Edit, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
export const couponColumns: ColumnDef<Coupon>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: "name",
    meta: {
      label: "쿠폰명",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="쿠폰명" />
    ),
    cell: ({ row }) => {
      const coupon = row.original;

      return (
        <div className="max-w-[300px] truncate">
          <Link
            href={`/admin/coupons/${coupon.id}`}
            className="hover:text-primary"
          >
            {coupon.name}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "code",
    meta: {
      label: "코드",
    },
    header: () => <div className="text-xs">코드</div>,
    cell: ({ row }) => <CodeCell row={row} />,
  },
  {
    accessorKey: "discountAmount",
    meta: {
      label: "할인금액",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="할인금액" />
    ),
    cell: ({ row }) => {
      const data = row.original;
      const discountAmount = parseInt(row.getValue("discountAmount"));
      return (
        <>
          {data.discountType === "percentage"
            ? `${discountAmount}%`
            : formatPrice(discountAmount)}
        </>
      );
    },
  },
  {
    accessorKey: "expiryDate",
    meta: {
      label: "만료일",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="만료일" />
    ),
    cell: ({ row }) => {
      const data = dateTimeFormat(row.getValue("expiryDate"));
      return <div className="text-xs truncate">{data}</div>;
    },
  },
  {
    id: "actions",
    header: ({ table }) => <ActionHeader table={table} />,
    cell: ({ row }) => <ActionCell row={row} />,
  },
];

function ActionHeader({ table }: { table: Table<Coupon> }) {
  const router = useRouter();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const [isLoading, setIsLoading] = useState(false);
  const selectedRowLength = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="size-8 relative"
            disabled={selectedRowLength === 0}
          >
            <span className="sr-only">전체 메뉴 열기</span>
            <MoreHorizontal />
            {selectedRowLength > 0 && (
              <div className="absolute -top-1 -right-1 size-4 text-[11px] bg-primary rounded-full text-white aspect-square flex items-center justify-center">
                {selectedRowLength}
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>전체 설정</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={isLoading}
            onClick={async () => {
              if (!selectedRowLength) return;
              if (
                !confirm(
                  `선택한 ${selectedRowLength}개의 쿠폰을 정말 삭제하시겠습니까? 해당 쿠폰의 사용 기록 또한 모두 삭제됩니다.`
                )
              )
                return;

              try {
                setIsLoading(true);
                await axios.delete(`/api/coupons`, {
                  data: {
                    couponIds: selectedRows.map((row) => row.original.id),
                  },
                });

                table.resetRowSelection();

                router.refresh();
                toast.success(
                  `선택한 ${selectedRowLength}개의 쿠폰이 삭제되었습니다.`
                );
              } catch {
                toast.error("삭제 중 오류가 발생했습니다.");
              } finally {
                setIsLoading(false);
              }
            }}
          >
            선택된 데이터 삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ActionCell({ row }: { row: Row<Coupon> }) {
  const coupon = row.original;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="size-8" disabled={isLoading}>
            <span className="sr-only">메뉴 열기</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>설정</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(`${coupon.code}`)}
          >
            <Copy className="text-muted-foreground" />
            쿠폰 코드 복사
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link
              href={`/admin/coupons/${coupon.id}`}
              className="flex items-center"
            >
              <Edit className="size-4 mr-2 text-muted-foreground" />
              편집하기
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              if (
                !confirm(
                  "정말 삭제하시겠습니까? 삭제한 쿠폰은 복구할 수 없습니다."
                )
              )
                return;

              try {
                setIsLoading(true);
                await axios.delete(`/api/coupons/${coupon.id}`);

                router.refresh();
                toast.success("쿠폰이 삭제되었습니다.");
              } catch {
                toast.error("삭제 중 오류가 발생했습니다.");
              } finally {
                setIsLoading(false);
              }
            }}
          >
            <Trash2 className="size-4 text-muted-foreground" />
            삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function CodeCell({ row }: { row: Row<Coupon> }) {
  const data = row.original;
  return (
    <Button
      variant="secondary"
      size="sm"
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(data.code);
        toast.info(`코드가 복사되었습니다. 코드 : ${data.code}`);
      }}
    >
      {data.code}
    </Button>
  );
}
