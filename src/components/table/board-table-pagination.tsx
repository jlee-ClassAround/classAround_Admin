import { Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "../ui/button";

interface BoardTablePaginationProps<TData> {
  table: Table<TData>;
}

export function BoardTablePagination<TData>({
  table,
}: BoardTablePaginationProps<TData>) {
  const getPageNumbers = () => {
    const currentPage = table.getState().pagination.pageIndex;
    const totalPages = table.getPageCount();
    const pageNumbers = [];

    // 현재 페이지 기준으로 앞뒤 2개씩 페이지 번호 계산
    let startPage = Math.max(currentPage - 2, 0);
    let endPage = Math.min(currentPage + 2, totalPages - 1);

    // 시작 페이지가 0에 가까울 때 endPage 조정
    if (startPage === 0) {
      endPage = Math.min(4, totalPages - 1);
    }

    // 마지막 페이지가 totalPages에 가까울 때 startPage 조정
    if (endPage === totalPages - 1) {
      startPage = Math.max(totalPages - 5, 0);
    }

    // 페이지 번호 배열 생성
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  return (
    <div className="flex items-center space-x-6 lg:space-x-8 justify-center">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <span className="sr-only">첫번째 페이지로 가기</span>
          <ChevronsLeft />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <span className="sr-only">이전 페이지로 가기</span>
          <ChevronLeft />
        </Button>
        {/* 페이지 번호 버튼들 */}
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((pageIndex) => (
            <Button
              key={pageIndex}
              variant={
                pageIndex === table.getState().pagination.pageIndex
                  ? "default"
                  : "outline"
              }
              className="size-8 p-0"
              onClick={() => table.setPageIndex(pageIndex)}
            >
              {pageIndex + 1}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <span className="sr-only">다음 페이지로 가기</span>
          <ChevronRight />
        </Button>
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <span className="sr-only">마지막 페이지로 가기</span>
          <ChevronsRight />
        </Button>
      </div>
    </div>
  );
}
