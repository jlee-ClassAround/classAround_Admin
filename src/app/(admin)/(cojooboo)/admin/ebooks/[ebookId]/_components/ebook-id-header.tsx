"use client";

import { cn } from "@/lib/utils";
import { Ebook } from "@prisma/client";
import { Eye, ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  ebook: Ebook;
}

export function EbookIdHeader({ ebook }: Props) {
  const pathname = usePathname();

  return (
    <div className="flex justify-between mb-6 items-start">
      <div className="flex items-center gap-x-5">
        <div className="relative aspect-[2/3] max-w-[80px] w-full bg-gray-50 flex-shrink-0 rounded-lg overflow-hidden border">
          {ebook.thumbnail ? (
            <Image
              fill
              src={ebook.thumbnail}
              alt="Ebook Thumbnail"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <ImageIcon className="size-8 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-y-5 flex-shrink-0">
          <h1 className="text-2xl font-semibold">{ebook.title}</h1>
          <div className="flex items-center gap-x-5 text-sm font-medium">
            <Link
              href={`/admin/ebooks/${ebook.id}`}
              className={cn(
                "border-b-2 pb-1 border-transparent transition-colors text-gray-500",
                pathname === `/admin/ebooks/${ebook.id}` &&
                  "border-primary text-black"
              )}
            >
              기본 설정
            </Link>
            {/* <Link
              href={`/admin/ebooks/${ebook.id}/students`}
              className={cn(
                "border-b-2 pb-1 border-transparent transition-colors text-gray-500",
                pathname.includes(`/admin/ebooks/${ebook.id}/students`) &&
                  "border-primary text-black"
              )}
            >
              수강생
            </Link> */}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-x-2">
        <Link href={`/ebooks/${ebook.id}`}>
          <Eye className="size-4" />
          <span className="sr-only">미리보기</span>
        </Link>
      </div>
    </div>
  );
}
