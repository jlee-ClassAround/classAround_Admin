"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import queryString from "query-string";

interface Props<TData> {
  currentPage: number;
  totalPages: number;
}

export function DataTablePagination<TData>({
  currentPage,
  totalPages,
}: Props<TData>) {
  const router = useRouter();
  const getPageNumbers = () => {
    const pageNumbers = [];

    // 현재 페이지 기준으로 앞뒤 2개씩 페이지 번호 계산
    let startPage = Math.max(currentPage - 2, 1);
    let endPage = Math.min(currentPage + 2, totalPages);

    // 시작 페이지가 0에 가까울 때 endPage 조정
    if (startPage === 1) {
      endPage = Math.min(5, totalPages);
    }

    // 마지막 페이지가 totalPages에 가까울 때 startPage 조정
    if (endPage === totalPages) {
      startPage = Math.max(totalPages - 5, 1);
    }

    // 페이지 번호 배열 생성
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  const handlePageChange = (page: number) => {
    const url = queryString.stringifyUrl(
      {
        url: "/admin/kajabi/tags",
        query: {
          page: page === 1 ? undefined : page,
        },
      },
      { skipNull: true, skipEmptyString: true }
    );

    router.push(url);
  };

  return (
    <div className="flex items-center space-x-6 lg:space-x-8 justify-center">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          <span className="sr-only">첫번째 페이지로 가기</span>
          <ChevronsLeft />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
        >
          <span className="sr-only">이전 페이지로 가기</span>
          <ChevronLeft />
        </Button>
        {/* 페이지 번호 버튼들 */}
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((pageIndex) => (
            <Button
              key={pageIndex}
              variant={pageIndex === currentPage ? "default" : "outline"}
              className="size-8 p-0"
              onClick={() => handlePageChange(pageIndex)}
            >
              {pageIndex}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() =>
            handlePageChange(Math.min(currentPage + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          <span className="sr-only">다음 페이지로 가기</span>
          <ChevronRight />
        </Button>
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <span className="sr-only">마지막 페이지로 가기</span>
          <ChevronsRight />
        </Button>
      </div>
    </div>
  );
}
