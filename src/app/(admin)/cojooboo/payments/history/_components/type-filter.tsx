"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

const TYPE_OPTIONS = [
  { label: "전체 상품", value: "ALL" },
  { label: "강의", value: "COURSE" },
  { label: "전자책", value: "EBOOK" },
];

export function TypeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentType = searchParams.get("type") || "ALL";

  const onTypeChange = (type: string) => {
    const params = new URLSearchParams(searchParams);
    if (type === "ALL") {
      params.delete("type");
    } else {
      params.set("type", type);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <Select value={currentType} onValueChange={onTypeChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="상품 유형 선택" />
      </SelectTrigger>
      <SelectContent>
        {TYPE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
