"use client";

import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { cn } from "@/lib/utils";
import { dateTimeFormat } from "@/utils/formats";
import { Category, Teacher } from "@prisma/client";
import { ColumnDef, Row, Table } from "@tanstack/react-table";
import axios from "axios";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface TeacherWithCategory extends Teacher {
  category: Category | null;
}

export const columns: ColumnDef<TeacherWithCategory>[] = [
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
    accessorKey: "profile",
    meta: {
      label: "프로필",
    },
    header: () => <div className="text-xs">프로필</div>,
    cell: ({ row }) => {
      const teacher = row.original;
      return (
        <Avatar>
          <AvatarImage
            src={teacher.profile || undefined}
            className="object-cover"
          />
          <AvatarFallback>{teacher.name.substring(0, 1)}</AvatarFallback>
        </Avatar>
      );
    },
  },
  {
    accessorKey: "name",
    meta: {
      label: "강사명",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="강사명" />
    ),
    cell: ({ row }) => {
      const teacher = row.original;

      return (
        <div className="max-w-[300px] truncate">
          <Link
            href={`/admin/teachers/${teacher.id}`}
            className="hover:text-primary"
          >
            {teacher.name}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "category.name",
    meta: {
      label: "카테고리",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="카테고리" />
    ),
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="text-xs truncate">{data.category?.name || "없음"}</div>
      );
    },
  },
  {
    accessorKey: "isPublished",
    meta: {
      label: "상태",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="상태" />
    ),
    cell: ({ row }) => {
      const isPublished = row.getValue("isPublished");
      return (
        <Badge
          variant="secondary"
          className={cn(
            "rounded-full",
            isPublished
              ? "bg-green-200 text-green-500"
              : "bg-gray-200 text-gray-500"
          )}
        >
          {isPublished ? "공개" : "비공개"}
        </Badge>
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

function ActionHeader({ table }: { table: Table<TeacherWithCategory> }) {
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
                  `선택한 ${selectedRowLength}개의 강사정보를 정말 삭제하시겠습니까? 삭제된 정보는 되돌릴 수 없습니다.`
                )
              )
                return;

              try {
                setIsLoading(true);
                await axios.delete(`/api/teachers`, {
                  data: {
                    ids: selectedRows.map((row) => row.original.id),
                  },
                });

                table.resetRowSelection();
                router.refresh();
                toast.success(
                  `선택한 ${selectedRowLength}개의 강사정보가 삭제되었습니다.`
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

function ActionCell({ row }: { row: Row<TeacherWithCategory> }) {
  const teacher = row.original;
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
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link
              href={`/admin/teachers/${teacher.id}`}
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
                  "정말 삭제하시겠습니까? 삭제한 강사정보는 복구할 수 없습니다."
                )
              )
                return;

              try {
                setIsLoading(true);
                await axios.delete(`/api/teachers/${teacher.id}`);

                router.refresh();
                toast.success("강사정보가 삭제되었습니다.");
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
