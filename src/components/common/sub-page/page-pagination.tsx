"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  totalPages: number;
  className?: string;
}

export function PagePagination({ totalPages, className }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const currentPage = Number(searchParams.get("page")) || 1;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);

    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }

    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const SIBLINGS_COUNT = 2; // 현재 페이지 앞뒤로 보여줄 페이지 수

    // 첫 페이지 버튼
    buttons.push(
      <Button
        key={1}
        variant={1 === currentPage ? "default" : "outline"}
        onClick={() => handlePageChange(1)}
        size="icon"
      >
        1
      </Button>
    );

    // 현재 페이지 기준으로 표시할 범위 계산
    const startPage = Math.max(2, currentPage - SIBLINGS_COUNT);
    const endPage = Math.min(totalPages - 1, currentPage + SIBLINGS_COUNT);

    // 첫 페이지와 시작 페이지 사이에 간격이 있는 경우 ... 표시
    if (startPage > 2) {
      buttons.push(
        <Button key="start-dots" variant="ghost" size="icon" disabled>
          <MoreHorizontal />
        </Button>
      );
    }

    // 중간 페이지들
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="icon"
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }

    // 마지막 페이지와 끝 페이지 사이에 간격이 있는 경우 ... 표시
    if (endPage < totalPages - 1) {
      buttons.push(
        <Button key="end-dots" variant="ghost" size="icon" disabled>
          <MoreHorizontal />
        </Button>
      );
    }

    // 마지막 페이지 버튼 (totalPages가 1보다 큰 경우에만)
    if (totalPages > 1) {
      buttons.push(
        <Button
          key={totalPages}
          variant={totalPages === currentPage ? "default" : "outline"}
          size="icon"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }

    return buttons;
  };

  return (
    <div className={cn("flex items-center justify-center gap-x-2", className)}>
      {renderPaginationButtons()}
    </div>
  );
}
