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
import { dateTimeFormat } from "@/utils/formats";
import { User } from "@prisma/client";
import { ColumnDef, Row, Table } from "@tanstack/react-table";
import axios from "axios";
import { Copy, Edit, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteUser } from "../_actions/delete-user";
import { deleteUsers } from "../_actions/delete-users";

export const userColumns: ColumnDef<User>[] = [
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
    accessorKey: "username",
    meta: {
      label: "유저명",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="유저명" />
    ),
    cell: ({ row }) => {
      const data = row.original;

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
    accessorKey: "email",
    meta: {
      label: "이메일",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="이메일" />
    ),
    cell: ({ row }) => {
      const data = row.original;
      return <div>{data.email}</div>;
    },
  },
  {
    accessorKey: "phone",
    meta: {
      label: "휴대폰",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="휴대폰" />
    ),
    cell: ({ row }) => {
      const data = row.original;
      return <div>{data.phone}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    meta: {
      label: "가입일",
    },
    enableGlobalFilter: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="가입일" />
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

function ActionHeader({ table }: { table: Table<User> }) {
  const router = useRouter();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const [isLoading, setIsLoading] = useState(false);
  const selectedRowLength = table.getFilteredSelectedRowModel().rows.length;

  const handleDelete = async () => {
    if (!selectedRowLength) return;
    if (
      !confirm(
        `선택한 ${selectedRowLength}개의 유저 정보를 정말 삭제하시겠습니까? 삭제된 정보는 되돌릴 수 없습니다.`
      )
    )
      return;

    try {
      setIsLoading(true);
      await deleteUsers(selectedRows.map((row) => row.original.id));

      table.resetRowSelection();
      router.refresh();
      toast.success(
        `선택한 ${selectedRowLength}개의 유저정보가 모두 삭제되었습니다.`
      );
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

function ActionCell({ row }: { row: Row<User> }) {
  const data = row.original;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        "정말 삭제하시겠습니까? 삭제한 유저정보는 복구할 수 없습니다. 신중하게 선택해주세요!"
      )
    )
      return;
    try {
      setIsLoading(true);
      await deleteUser(data.id);
      router.refresh();
      toast.success("유저정보가 삭제되었습니다.");
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
          <Button variant="ghost" className="size-8" disabled={isLoading}>
            <span className="sr-only">메뉴 열기</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>설정</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(`${data.email}`)}
          >
            <Copy className="text-muted-foreground" />
            이메일 복사
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link
              href={`/admin/users/${data.id}`}
              className="flex items-center"
            >
              <Edit className="size-4 mr-2 text-muted-foreground" />
              상세보기
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete}>
            <Trash2 className="size-4 text-muted-foreground" />
            삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
