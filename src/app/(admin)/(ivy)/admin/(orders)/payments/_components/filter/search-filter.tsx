"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchFilter({ value, onChange }: SearchFilterProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="search" className="text-sm font-medium">
        구매자 정보 검색
      </Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="search"
          placeholder="이름, 이메일, 전화번호, 결제키로 검색"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-7"
        />
      </div>
    </div>
  );
}
