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
import { cn } from "@/lib/utils";
import { dateTimeFormat } from "@/utils/formats";
import { FreeCourse } from "@prisma/client";
import { ColumnDef, Row, Table } from "@tanstack/react-table";
import { Copy, CopyPlusIcon, Edit, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  deleteFreeCourse,
  deleteFreeCourses,
  duplicateFreeCourse,
} from "../actions";

export const columns: ColumnDef<FreeCourse>[] = [
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
      label: "강의명",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="강의명" />
    ),
    cell: ({ row }) => {
      const course = row.original;

      return (
        <div className="max-w-[300px] truncate">
          <Link
            href={`/admin/free-courses/${course.id}`}
            className="hover:text-primary"
          >
            {course.title}
          </Link>
        </div>
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

function ActionHeader({ table }: { table: Table<FreeCourse> }) {
  const router = useRouter();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const [isLoading, setIsLoading] = useState(false);
  const selectedRowLength = table.getFilteredSelectedRowModel().rows.length;

  const handleDelete = async () => {
    if (!selectedRowLength) return;
    if (
      !confirm(
        `선택한 ${selectedRowLength}개의 강의를 정말 삭제하시겠습니까? 삭제된 정보는 되돌릴 수 없습니다.`
      )
    )
      return;

    try {
      setIsLoading(true);
      await deleteFreeCourses({
        ids: selectedRows.map((row) => row.original.id),
      });

      table.resetRowSelection();
      router.refresh();
      toast.success(`선택한 ${selectedRowLength}개의 강의가 삭제되었습니다.`);
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

function ActionCell({ row }: { row: Row<FreeCourse> }) {
  const data = row.original;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까? 삭제된 강의는 되돌릴 수 없습니다."))
      return;

    try {
      setIsLoading(true);
      await deleteFreeCourse(data.id);

      router.refresh();
      toast.success("강의가 삭제되었습니다.");
    } catch {
      toast.error("삭제 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      setIsLoading(true);
      await duplicateFreeCourse(data.id);

      router.refresh();
      toast.success("강의가 복제되었습니다.");
    } catch {
      toast.error("복제 중 오류가 발생했습니다.");
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
          <DropdownMenuItem
            onClick={() =>
              navigator.clipboard.writeText(`/free-courses/${data.id}`)
            }
          >
            <Copy className="text-muted-foreground" />
            강의 주소 복사
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link
              href={`/admin/free-courses/${data.id}`}
              className="flex items-center"
            >
              <Edit className="size-4 mr-2 text-muted-foreground" />
              편집하기
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem disabled={isLoading} onClick={handleDuplicate}>
            <CopyPlusIcon className="size-4 text-muted-foreground" />
            복제
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
