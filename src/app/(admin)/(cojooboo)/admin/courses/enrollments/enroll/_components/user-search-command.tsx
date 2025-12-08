"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { Check, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import queryString from "query-string";
import { useEffect, useState } from "react";

interface Props {
  options: { id: string; label: string }[];
  onChange: (value: { id: string; label: string }[]) => void;
  value?: { id: string; label: string }[];
  disabled?: boolean;
}

export function UserSearchCommand({
  options,
  onChange,
  value = [],
  disabled = false,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchValue, setSearchValue] = useState("");
  const debouncedValue = useDebounce(searchValue, 300);

  useEffect(() => {
    const url = queryString.stringifyUrl(
      {
        url: pathname,
        query: {
          search: debouncedValue,
        },
      },
      { skipEmptyString: true, skipNull: true }
    );
    router.push(url);
  }, [debouncedValue]);

  return (
    <Command className="border">
      <div className="flex items-center px-3 border-b">
        <Search className="size-4 text-muted-foreground" />
        <Input
          placeholder="사용자 검색"
          disabled={disabled}
          onChange={(e) => {
            setSearchValue(e.target.value);
          }}
          className="border-none shadow-none focus-visible:ring-0"
        />
      </div>
      <CommandList>
        <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
        <CommandGroup>
          {options.map((option) => (
            <CommandItem
              key={option.id}
              disabled={disabled}
              value={option.id}
              onSelect={(e) => {
                onChange(
                  value.some((val) => val.id === e)
                    ? value.filter((val) => val.id !== e)
                    : [...value, option]
                );
              }}
              className="cursor-pointer"
            >
              <Check
                className={cn(
                  "size-4",
                  value.some((val) => val.id === option.id)
                    ? "opacity-100"
                    : "opacity-0"
                )}
              />
              {option.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
