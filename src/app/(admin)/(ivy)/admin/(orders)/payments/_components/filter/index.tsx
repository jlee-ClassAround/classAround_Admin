"use client";

import { Button } from "@/components/ui/button";
import {
  getPaymentMethodToKr,
  getPaymentStatusToKr,
} from "@/utils/payments/get-enum-to-kr";
import { getProductCategoryToKr } from "@/utils/products/get-enum-to-kr";
import { PaymentMethod, PaymentStatus, ProductCategory } from "@prisma/client";
import { RotateCcw } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { DateRangeFilter } from "./date-range-filter";
import { SearchFilter } from "./search-filter";
import { SelectFilter } from "./select-filter";

export function PaymentFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [search, setSearch] = useState(searchParams.get("search") || "");

  const productCategory = searchParams.get("productCategory") || "ALL";
  const paymentMethod = searchParams.get("paymentMethod") || "ALL";
  const taxFree = searchParams.get("taxFree") || "ALL";
  const paymentStatus = searchParams.get("paymentStatus") || "ALL";

  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const from = searchParams.get("dateFrom");
    const to = searchParams.get("dateTo");
    if (from && to) {
      return {
        from: new Date(from),
        to: new Date(to),
      };
    }
    return undefined;
  });

  const updateURL = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "ALL") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setSearch("");
    setDateRange(undefined);
    router.push(`${pathname}`);
  };

  // 검색어 입력 시 디바운스 적용
  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL({ search });
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleDateChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);

    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    let newFrom: string | undefined;
    let newTo: string | undefined;

    if (newDateRange?.from) {
      const fromDate = new Date(newDateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      newFrom = fromDate.toISOString();
    }

    if (newDateRange?.to) {
      const toDate = new Date(newDateRange.to);
      toDate.setHours(23, 59, 59, 999);
      newTo = toDate.toISOString();
    }

    if (dateFrom !== newFrom || dateTo !== newTo) {
      const params = new URLSearchParams(searchParams);

      if (newFrom) {
        params.set("dateFrom", newFrom);
      } else {
        params.delete("dateFrom");
      }

      if (newTo) {
        params.set("dateTo", newTo);
      } else {
        params.delete("dateTo");
      }

      router.push(`?${params.toString()}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <SearchFilter value={search} onChange={setSearch} />
        <SelectFilter
          id="productCategory"
          label="상품유형"
          placeholder="상품유형 선택"
          options={Object.values(ProductCategory).map((category) => ({
            label: getProductCategoryToKr(category),
            value: category,
          }))}
          value={productCategory}
          onChange={(value) => updateURL({ productCategory: value })}
        />
        <SelectFilter
          id="paymentMethod"
          label="결제수단"
          placeholder="결제수단 선택"
          options={Object.values(PaymentMethod).map((method) => ({
            label: getPaymentMethodToKr(method),
            value: method,
          }))}
          value={paymentMethod}
          onChange={(value) => updateURL({ paymentMethod: value })}
        />
        <SelectFilter
          id="taxFree"
          label="면세여부"
          placeholder="면세여부 선택"
          options={[
            {
              label: "과세",
              value: "false",
            },
            {
              label: "면세",
              value: "true",
            },
          ]}
          value={taxFree}
          onChange={(value) => updateURL({ taxFree: value })}
        />
        <SelectFilter
          id="paymentStatus"
          label="결제상태"
          placeholder="결제상태 선택"
          options={Object.values(PaymentStatus).map((status) => ({
            label: getPaymentStatusToKr(status),
            value: status,
          }))}
          value={paymentStatus}
          onChange={(value) => updateURL({ paymentStatus: value })}
        />
        <DateRangeFilter date={dateRange} onDateChange={handleDateChange} />
      </div>
      <div className="flex justify-start">
        <Button onClick={handleResetFilters} variant="outline" size="sm">
          <RotateCcw className="!size-3" />
          초기화
        </Button>
      </div>
    </div>
  );
}
