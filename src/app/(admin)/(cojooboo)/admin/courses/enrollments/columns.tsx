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
import { Course, Enrollment, User } from "@prisma/client";
import { ColumnDef, Row, Table } from "@tanstack/react-table";
import axios from "axios";
import { MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteEnrollment, deleteEnrollments } from "./actions";

interface EnrollmentWithRelations extends Enrollment {
  course: Course;
  user: User;
}

export const columns: ColumnDef<EnrollmentWithRelations>[] = [
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
    accessorKey: "course.title",
    meta: {
      label: "강의명",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="강의명" />
    ),
    cell: ({ row }) => {
      const data = row.original.course;

      return (
        <div className="max-w-[300px] truncate">
          <Link
            href={`/admin/courses/${data.id}`}
            className="hover:text-primary hover:underline"
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
      label: "유저명",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="유저명" />
    ),
    cell: ({ row }) => {
      const data = row.original.user;
      return (
        <div className="truncate">
          <Link
            href={`/admin/users/${data.id}`}
            className="hover:text-primary hover:underline"
          >
            {data.username}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    meta: {
      label: "등록일",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="등록일" />
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

function ActionHeader({ table }: { table: Table<EnrollmentWithRelations> }) {
  const router = useRouter();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const [isLoading, setIsLoading] = useState(false);
  const selectedRowLength = table.getFilteredSelectedRowModel().rows.length;

  const handleDelete = async () => {
    if (!selectedRowLength) return;
    if (
      !confirm(
        `선택한 ${selectedRowLength}개의 등록 정보를 정말 삭제하시겠습니까?
삭제된 정보는 되돌릴 수 없습니다. 수강생은 더 이상 강의를 수강할 수 없습니다.`
      )
    )
      return;

    try {
      setIsLoading(true);
      await deleteEnrollments(selectedRows.map((row) => row.original.id));

      table.resetRowSelection();
      router.refresh();
      toast.success(
        `선택한 ${selectedRowLength}개의 등록 정보가 삭제되었습니다.`
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

function ActionCell({ row }: { row: Row<EnrollmentWithRelations> }) {
  const data = row.original;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        "정말 삭제하시겠습니까? 삭제된 등록 정보는 되돌릴 수 없습니다. 수강생은 더 이상 강의를 수강할 수 없습니다."
      )
    )
      return;

    try {
      setIsLoading(true);
      await deleteEnrollment(data.id);

      router.refresh();
      toast.success("등록 정보가 삭제되었습니다.");
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
          <DropdownMenuItem disabled={isLoading} onClick={handleDelete}>
            <Trash2 className="size-4 text-muted-foreground" />
            수강 취소
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
