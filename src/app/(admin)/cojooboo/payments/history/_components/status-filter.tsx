"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

const STATUS_OPTIONS = [
  { label: "전체 상태", value: "ALL" },
  { label: "결제완료", value: "COMPLETED" },
  { label: "취소됨", value: "CANCELLED" },
  { label: "환불됨", value: "REFUNDED" },
];

export function StatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") || "ALL";

  const onStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status === "ALL") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <Select value={currentStatus} onValueChange={onStatusChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="결제 상태 선택" />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
