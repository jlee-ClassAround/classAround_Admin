"use client";

import axios from "axios";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

import { dateTimeFormat } from "@/utils/formats";
import { Review, User } from "@prisma/client";
import { ColumnDef, Row, Table } from "@tanstack/react-table";
import { toast } from "sonner";

interface ReviewWithUser extends Review {
  user: User;
}

export const columns: ColumnDef<ReviewWithUser>[] = [
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
    accessorKey: "title",
    meta: {
      label: "제목",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="제목" />
    ),
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="max-w-[300px] truncate">
          <Link
            href={`/admin/boards/reviews/${data.id}`}
            className="hover:text-primary"
          >
            {data.title}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "user.username",
    meta: {
      label: "작성자",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="작성자" />
    ),
    cell: ({ row }) => {
      const data = row.original.user;
      return (
        <div className="max-w-[300px] truncate">
          <Link href={`/admin/users/${data.id}`} className="hover:text-primary">
            {data.username}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    meta: {
      label: "생성일",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="생성일" />
    ),
    cell: ({ row }) => {
      const data = dateTimeFormat(row.getValue("createdAt"));
      return <div className="text-xs truncate">{data}</div>;
    },
  },
  {
    id: "actions",
    header: ({ table }) => <ActionHeader table={table} />,
    cell: ({ row }) => <ActionCell row={row} />,
  },
];

function ActionHeader({ table }: { table: Table<ReviewWithUser> }) {
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
            disabled={selectedRowLength === 0 || isLoading}
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
                  `선택한 ${selectedRowLength}개의 데이터를 정말 삭제하시겠습니까? 삭제된 정보는 되돌릴 수 없습니다.`
                )
              )
                return;

              try {
                setIsLoading(true);
                await axios.delete(`/api/boards/reviews`, {
                  data: {
                    ids: selectedRows.map((row) => row.original.id),
                  },
                });

                table.resetRowSelection();

                router.refresh();
                toast.success(
                  `선택한 ${selectedRowLength}개의 정보가 삭제되었습니다.`
                );
              } catch {
                toast.error("오류가 발생했습니다.");
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

function ActionCell({ row }: { row: Row<ReviewWithUser> }) {
  const data = row.original;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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
              href={`/admin/boards/reviews/${data.id}`}
              className="flex items-center"
            >
              <Edit className="size-4 mr-2 text-muted-foreground" />
              편집하기
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isLoading}
            onClick={async () => {
              if (
                !confirm(
                  "정말 삭제하시겠습니까? 삭제된 정보는 되돌릴 수 없습니다."
                )
              )
                return;

              try {
                setIsLoading(true);
                await axios.delete(`/api/boards/reviews/${data.id}`);

                router.refresh();
                toast.success("삭제가 완료되었습니다.");
              } catch {
                toast.error("오류가 발생했습니다.");
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
