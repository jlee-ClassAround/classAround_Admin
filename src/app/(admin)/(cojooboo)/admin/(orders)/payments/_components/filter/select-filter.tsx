"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  id: string;
  label: string;
  placeholder: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}

export function SelectFilter({
  id,
  label,
  placeholder,
  options,
  value,
  onChange,
}: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange} defaultValue="ALL">
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem key="ALL" value="ALL">
            전체
          </SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
