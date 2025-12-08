"use client";

import { EnrolledCourse } from "@/actions/courses/get-enrolled-courses";
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
import { Progress } from "@/components/ui/progress";
import { ColumnDef, Row, Table } from "@tanstack/react-table";
import { Edit, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const columns: ColumnDef<EnrolledCourse>[] = [
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
            href={`/admin/courses/${data.id}`}
            className="hover:text-primary"
          >
            {data.title}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "progress",
    meta: {
      label: "진행률",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="진행률" />
    ),
    cell: ({ row }) => {
      const progress = row.original.progress;
      return (
        <div className="flex items-center gap-x-2">
          <span className="text-xs font-medium">{progress}%</span>
          <Progress value={progress} className="w-full" />
        </div>
      );
    },
  },
  {
    id: "actions",
    header: ({ table }) => <ActionHeader table={table} />,
    cell: ({ row }) => <ActionCell row={row} />,
  },
];

function ActionHeader({ table }: { table: Table<EnrolledCourse> }) {
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
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ActionCell({ row }: { row: Row<EnrolledCourse> }) {
  const data = row.original;
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="size-8">
            <span className="sr-only">메뉴 열기</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>설정</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link
              href={`/admin/courses/${data.id}`}
              className="flex items-center"
            >
              <Edit className="size-4 mr-2 text-muted-foreground" />
              상세보기
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
