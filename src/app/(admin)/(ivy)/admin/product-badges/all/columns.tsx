"use client";

import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
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
import { ProductBadge } from "@prisma/client";
import { ColumnDef, Row, Table } from "@tanstack/react-table";
import axios from "axios";
import { format } from "date-fns";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export const columns: ColumnDef<ProductBadge>[] = [
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
      label: "뱃지명",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="뱃지명" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-x-2">
          <Link href={`/admin/product-badges/${row.original.id}`}>
            <Badge
              variant="outline"
              style={{
                backgroundColor: row.original.color || "#000000",
                color: row.original.textColor || "#ffffff",
              }}
            >
              {row.original.name}
            </Badge>
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    meta: {
      label: "설명",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="설명" />
    ),
    cell: ({ row }) => row.original.description || "-",
  },
  {
    accessorKey: "createdAt",
    meta: {
      label: "생성일",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="생성일" />
    ),
    cell: ({ row }) => format(new Date(row.original.createdAt), "yyyy.MM.dd"),
  },
  {
    id: "actions",
    header: ({ table }) => <ActionHeader table={table} />,
    cell: ({ row }) => <ActionCell row={row} />,
  },
];

function ActionHeader({ table }: { table: Table<ProductBadge> }) {
  const router = useRouter();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const [isLoading, setIsLoading] = useState(false);
  const selectedRowLength = table.getFilteredSelectedRowModel().rows.length;

  const handleDelete = async () => {
    if (!selectedRowLength) return;
    if (
      !confirm(
        `선택한 ${selectedRowLength}개의 배지를 정말 삭제하시겠습니까? 삭제된 정보는 되돌릴 수 없습니다.`
      )
    )
      return;

    try {
      setIsLoading(true);
      await axios.delete(`/api/product-badges`, {
        data: {
          ids: selectedRows.map((row) => row.original.id),
        },
      });

      table.resetRowSelection();
      router.refresh();
      toast.success(`선택한 ${selectedRowLength}개의 배지가 삭제되었습니다.`);
    } catch {
      toast.error("삭제 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

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
          <DropdownMenuItem disabled={isLoading} onClick={handleDelete}>
            선택된 데이터 삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ActionCell({ row }: { row: Row<ProductBadge> }) {
  const data = row.original;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까? 삭제된 배지는 되돌릴 수 없습니다."))
      return;

    try {
      setIsLoading(true);
      await axios.delete(`/api/product-badges/${data.id}`);

      router.refresh();
      toast.success("배지가 삭제되었습니다.");
    } catch {
      toast.error("삭제 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" disabled={isLoading} className="size-8">
            <span className="sr-only">메뉴 열기</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>설정</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link
              href={`/admin/product-badges/${data.id}`}
              className="flex items-center"
            >
              <Edit className="size-4 mr-2 text-muted-foreground" />
              편집하기
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem disabled={isLoading} onClick={handleDelete}>
            <Trash2 className="size-4 text-muted-foreground" />
            삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
