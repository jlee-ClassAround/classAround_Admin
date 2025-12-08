"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  Table as TableType,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableSearchInput } from "./data-table-search-input";
import { DataTableViewOptions } from "./data-table-view-options";
import { ServerSidePagination } from "./server-side-pagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  defaultPageSize?: number;
  noSearch?: boolean;
  // 서버 사이드 props
  isServerSide?: boolean;
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  // 서버 사이드 정렬/필터링 상태 (URL 파라미터에서 가져옴)
  serverSorting?: SortingState;
  serverColumnFilters?: ColumnFiltersState;
}

export function AdminDataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder,
  defaultPageSize = 50,
  noSearch = false,
  isServerSide = false,
  totalCount,
  currentPage = 1,
  totalPages,
  serverSorting,
  serverColumnFilters,
}: DataTableProps<TData, TValue>) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [sorting, setSorting] = React.useState<SortingState>(
    serverSorting ?? []
  );
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    serverColumnFilters ?? []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({
    pageIndex: currentPage - 1,
    pageSize: defaultPageSize,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),

    // 서버 사이드 모드 설정
    ...(isServerSide
      ? {
          manualPagination: true,
          manualSorting: true,
          manualFiltering: true,
          onPaginationChange: setPagination,

          pageCount: totalPages || -1,
        }
      : {
          getPaginationRowModel: getPaginationRowModel(),
          getSortedRowModel: getSortedRowModel(),
          getFilteredRowModel: getFilteredRowModel(),
        }),

    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      ...(isServerSide ? { pagination } : {}),
    },
  });

  // 서버 사이드 모드: 사용자가 정렬을 변경했을 때만 URL 업데이트
  const prevSortingRef = React.useRef<SortingState>(sorting);

  React.useEffect(() => {
    if (isServerSide) {
      const prevSort = prevSortingRef.current;
      const currentSort = sorting;

      // 정렬이 실제로 변경되었는지 확인
      const prevSortId = prevSort[0]?.id;
      const prevSortDesc = prevSort[0]?.desc;
      const currentSortId = currentSort[0]?.id;
      const currentSortDesc = currentSort[0]?.desc;

      if (prevSortId !== currentSortId || prevSortDesc !== currentSortDesc) {
        const params = new URLSearchParams(searchParams.toString());

        if (currentSort.length > 0) {
          params.set("sort", currentSortId);
          params.set("order", currentSortDesc ? "desc" : "asc");
          params.delete("page"); // 정렬 변경 시 첫 페이지로
          router.push(`?${params.toString()}`, { scroll: false });
        } else {
          // 정렬이 없어졌을 때 URL에서도 제거
          params.delete("sort");
          params.delete("order");
          params.delete("page");
          router.push(`?${params.toString()}`, { scroll: false });
        }

        prevSortingRef.current = currentSort;
      }
    }
  }, [isServerSide, sorting, searchParams, router]);

  React.useEffect(() => {
    if (!isServerSide) {
      table.setPageSize(defaultPageSize);
    }
  }, [table, isServerSide]);

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        {!noSearch && (
          <DataTableSearchInput
            table={table}
            searchKey={searchKey}
            searchPlaceholder={searchPlaceholder}
            isServerSide={isServerSide}
          />
        )}
        <DataTableViewOptions table={table} />
      </div>
      <div className="rounded-md border">
        <DataTable table={table} columns={columns} />
      </div>
      {isServerSide ? (
        <ServerSidePagination
          currentPage={currentPage}
          totalPages={totalPages || 0}
          totalCount={totalCount || 0}
          pageSize={defaultPageSize}
        />
      ) : (
        <DataTablePagination table={table} />
      )}
    </div>
  );
}

function DataTable<TData, TValue>({
  table,
  columns,
}: {
  table: TableType<TData>;
  columns: ColumnDef<TData, TValue>[];
}) {
  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              결과가 없습니다.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
