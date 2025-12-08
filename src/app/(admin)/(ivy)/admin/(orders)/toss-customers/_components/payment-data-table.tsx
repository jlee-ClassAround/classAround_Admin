"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DateRange } from "react-day-picker";
import { DateRangeFilter } from "./date-range-filter";
import { AdminDataTable } from "@/app/(admin)/_components/admin-data-table";
import { columns } from "../columns";
import { StatusFilter } from "./status-filter";
import { downloadCSV } from "@/lib/csv";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { TypeFilter } from "./type-filter";
import { CourseFilter, CourseOption } from "./course-filter";
import { Input } from "@/components/ui/input";
import { SearchInput } from "./search-input";

interface PaymentDataTableProps {
  data: any[];
  courseOptions: CourseOption[];
}

export function PaymentDataTable({
  data,
  courseOptions,
}: PaymentDataTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    if (from && to) {
      return {
        from: new Date(from),
        to: new Date(to),
      };
    }
    return undefined;
  });
  const type = searchParams.get("type") || "ALL";

  const handleDateChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);

    // URL 파라미터 업데이트
    const params = new URLSearchParams(searchParams);
    if (newDateRange?.from) {
      params.set("from", newDateRange.from.toISOString());
    } else {
      params.delete("from");
    }
    if (newDateRange?.to) {
      params.set("to", newDateRange.to.toISOString());
    } else {
      params.delete("to");
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleDownloadCSV = () => {
    const filename = `payment-history-${
      new Date().toISOString().split("T")[0]
    }`;
    downloadCSV(data, filename);
  };

  const onDeleteParams = () => {
    handleDateChange(undefined);
    router.push(`${pathname}`, { scroll: false });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-x-4 gap-y-2 flex-wrap">
        <DateRangeFilter date={dateRange} onDateChange={handleDateChange} />
        <StatusFilter />
        <TypeFilter />
        {type === "COURSE" && <CourseFilter courseOptions={courseOptions} />}
        <Button variant="outline" onClick={onDeleteParams}>
          필터삭제
        </Button>

        <Button
          onClick={handleDownloadCSV}
          variant="outline"
          size="sm"
          className="ml-auto"
        >
          <Download className="h-4 w-4 mr-2" />
          CSV 내보내기
        </Button>
      </div>
      <SearchInput />
      <AdminDataTable
        columns={columns}
        data={data}
        noSearch
        defaultPageSize={200}
      />
    </div>
  );
}
