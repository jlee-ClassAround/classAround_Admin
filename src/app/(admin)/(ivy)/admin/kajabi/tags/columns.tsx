"use client";

import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Copy, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

interface Props {
  id: string;
  name: string;
}

export const columns: ColumnDef<Props>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="태그명" />
    ),
    cell: ({ row }) => {
      const data = row.original;
      return <div className="max-w-[300px] truncate">{data.name}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell row={row} />,
  },
];

function ActionCell({ row }: { row: Row<Props> }) {
  const data = row.original;

  const handleCopy = async () => {
    navigator.clipboard.writeText(data.id);
    toast.info(`아이디가 복사되었습니다. ID: ${data.id}`);
  };

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
          <DropdownMenuItem onClick={handleCopy}>
            <Copy className="size-4 text-muted-foreground" />
            아이디 복사
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
