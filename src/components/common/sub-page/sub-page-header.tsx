"use client";

import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";
import { useState } from "react";

interface CategoryProps {
  id: string;
  name: string;
  description: string;
}

interface SubPageHeaderProps {
  title: string;
  categories: CategoryProps[];
  description?: string;
}

export function SubPageHeader({
  title,
  categories,
  description,
}: SubPageHeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryProps | null>(null);

  const categoryId = searchParams.get("categoryId");
  const courseType = searchParams.get("courseType");

  const onCategoryClick = (id: string) => {
    if (id === "free-courses") {
      setSelectedCategory({
        id: "",
        name: "무료 강의",
        description: "나에게 맞는 수익화 방법을 찾아보세요",
      });
    } else if (categoryId === id) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(
        categories.find((category) => category.id === id) || null
      );
    }

    const url = qs.stringifyUrl(
      {
        url: pathname,
        query:
          id === "free-courses"
            ? {
                courseType: "FREE",
              }
            : { categoryId: id === categoryId ? "" : id },
      },
      { skipNull: true, skipEmptyString: true }
    );
    router.push(url, { scroll: false });
  };

  return (
    <div className="space-y-10 md:space-y-[72px]">
      <div className="space-y-3 md:space-y-6">
        <h1 className="text-3xl md:text-5xl lg:text-[56px] !leading-tight font-nexonWarhaven">
          {title}
        </h1>
        <div className="truncate">
          <div className="flex items-center gap-x-1 md:gap-x-3 overflow-x-auto">
            <CategoryButton
              category={{ id: "", name: "전체", description: "" }}
              isActive={!categoryId && !courseType}
              onCategoryClick={onCategoryClick}
            />
            {categories.map((category) => {
              const isActive = categoryId === category.id;
              return (
                <CategoryButton
                  key={category.id}
                  category={category}
                  isActive={isActive}
                  onCategoryClick={onCategoryClick}
                />
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-x-5 md:gap-x-[30px]">
        <h2 className="text-2xl md:text-[28px] leading-tight font-semibold">
          {selectedCategory?.name || "전체"}
        </h2>
        <p className="md:text-xl text-foreground/80">
          {selectedCategory?.description || description}
        </p>
      </div>
    </div>
  );
}

interface CategoryButtonProps {
  category: CategoryProps;
  isActive: boolean;
  onCategoryClick: (id: string) => void;
}

function CategoryButton({
  category,
  isActive,
  onCategoryClick,
}: CategoryButtonProps) {
  return (
    <button
      className={cn(
        "md:text-xl py-2 md:py-2.5 px-4 md:px-5 rounded-full transition-all ring-1 ring-foreground/20 ring-inset",
        "hover:ring-2 hover:ring-primary hover:text-primary",
        isActive && "ring-2 ring-primary text-primary"
      )}
      onClick={() => onCategoryClick(category.id)}
    >
      {category.name}
    </button>
  );
}
