"use client";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function SearchInput() {
  const searchParams = useSearchParams();
  const [value, setValue] = useState("");
  const router = useRouter();
  const debouncedValue = useDebounce(value, 300);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedValue) {
      params.set("search", debouncedValue);
    } else {
      params.delete("search");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  }, [debouncedValue]);

  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="검색어를 입력해주세요"
      className="w-[400px]"
    />
  );
}
