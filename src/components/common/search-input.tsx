"use client";

import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import qs from "query-string";

interface Props {
  className?: string;
}

export function SearchInput({ className }: Props) {
  const router = useRouter();

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const searchQeury = (formData.get("search") as string) || "";
    if (!searchQeury.trim()) return;

    const searchUrl = qs.stringifyUrl(
      {
        url: "/search",
        query: {
          search: searchQeury,
        },
      },
      { skipEmptyString: true, skipNull: true }
    );

    router.push(searchUrl);
  };

  return (
    <div className={cn("relative w-[210px] bg-foreground/10", className)}>
      <form onSubmit={onSearch}>
        <input
          name="search"
          type="text"
          placeholder="강사, 강의명을 검색하세요"
          className={cn(
            "pl-3 py-2 pr-10 w-full",
            "placeholder:text-foreground/50 placeholder:text-sm",
            "outline-none bg-transparent text-[15px] font-light rounded-sm transition-colors ring-1 ring-transparent focus:ring-foreground/50",
            "hover:ring-primary/60"
          )}
        />
        <button type="submit">
          <Search className="size-4 absolute right-4 top-[11px] text-foreground/80" />
        </button>
      </form>
    </div>
  );
}
