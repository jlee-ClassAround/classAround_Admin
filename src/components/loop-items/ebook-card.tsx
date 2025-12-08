"use client";

import Image from "next/image";
import Link from "next/link";

import { EbookWithCategory } from "@/actions/ebooks/get-ebooks";
import { cn } from "@/lib/utils";
import { ProductBadge } from "../common/product-badge";

interface Props {
  ebook: EbookWithCategory;
}

export function EbookCard({ ebook }: Props) {
  return (
    <Link href={`/ebooks/${ebook.id}`}>
      <div className="flex flex-col gap-y-3 md:gap-y-5 md:hover:-translate-y-1 md:transition-transform md:pt-1">
        <div className="relative aspect-[2/3] bg-foreground/10 rounded-xl md:rounded-2xl lg:rounded-[20px] overflow-hidden">
          <Image
            fill
            src={ebook.thumbnail || ""}
            alt="Ebook Thumbnail"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-y-3 justify-between flex-1">
          {ebook.productBadge.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {ebook.productBadge.map((badge) => (
                <ProductBadge
                  key={badge.id}
                  label={badge.name}
                  backgroundColor={badge.color || "#000"}
                  textColor={badge.textColor || "#fff"}
                />
              ))}
            </div>
          )}
          <h3 className="text-lg md:text-xl lg:text-2xl font-semibold line-clamp-2">
            {ebook.title}
          </h3>
          <div className="flex items-center gap-x-2">
            {ebook.category && (
              <>
                <div className="w-px h-3 bg-foreground/50 rounded-full" />
                <span className="text-foreground/70 text-nowrap">
                  {ebook.category.name}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function NewTag() {
  return (
    <div
      className={cn(
        "text-xs font-bold py-1 px-2 rounded-sm leading-tight",
        "bg-gradient-to-b from-[#ABA7A4] from-0% via-[#454342] via-70% to-[#848887] to-100%"
      )}
    >
      New
    </div>
  );
}

function BestTag() {
  return (
    <div
      className={cn(
        "text-xs font-bold py-1 px-2 rounded-sm leading-tight text-background",
        "bg-gradient-to-b from-[#F8DB70] from-11.84% via-[#EEC55B] via-50.99% to-[#F7E38A] to-100%"
      )}
    >
      Best
    </div>
  );
}
