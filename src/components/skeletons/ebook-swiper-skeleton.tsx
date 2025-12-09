import { Skeleton } from "@/components/ui/skeleton";

export function EbookSwiperSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-3 md:gap-x-5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-x-5">
          {/* 썸네일 스켈레톤 */}
          <div className="relative aspect-[2/3] w-[180px] flex-shrink-0">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>

          {/* 콘텐츠 스켈레톤 */}
          <div className="flex flex-col gap-y-2 flex-1">
            {/* 제목 스켈레톤 */}
            <Skeleton className="h-7 w-3/4" />

            {/* 설명 스켈레톤 - 2줄 */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
