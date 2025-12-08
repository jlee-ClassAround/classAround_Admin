"use client";

import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useRouter, useSearchParams } from "next/navigation";

interface Props<TData> {
  searchPlaceholder?: string;
  searchKey?: string;
  table: Table<TData>;
  isServerSide?: boolean;
}

export function DataTableSearchInput<TData>({
  searchPlaceholder,
  searchKey,
  table,
  isServerSide,
}: Props<TData>) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedValue = useDebounce(searchTerm, 300);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedValue) {
      params.set("search", debouncedValue);
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(`?${params.toString()}`, { scroll: false });
  }, [debouncedValue]);

  const onSearch = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <Input
      placeholder={searchPlaceholder}
      {...(isServerSide
        ? {
            value: searchTerm || "",
            onChange: (event) => onSearch(event.target.value),
          }
        : searchKey
        ? {
            value:
              (table.getColumn(searchKey)?.getFilterValue() as string) ?? "",
            onChange: (event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value),
          }
        : {
            value: table.getState().globalFilter,
            onChange: (event) => table.setGlobalFilter(event.target.value),
          })}
      className="max-w-sm"
    />
  );
}
