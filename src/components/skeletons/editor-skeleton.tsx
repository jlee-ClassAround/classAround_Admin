import { Skeleton } from "@/components/ui/skeleton";

export function EditorSkeleton() {
  return (
    <div className="space-y-2">
      {/* 툴바 영역 */}
      <div className="flex items-center gap-x-2 p-2 border rounded-md bg-white">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-8 w-8" />
        ))}
        <div className="h-4 w-[1px] bg-gray-200 mx-2" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-8 w-8" />
        ))}
      </div>

      {/* 에디터 본문 영역 */}
      <div className="border rounded-md p-3">
        <div className="space-y-3">
          {/* 제목 라인 */}
          <Skeleton className="h-7 w-3/4" />

          {/* 본문 라인들 */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />

          {/* 여백 */}
          <div className="h-[200px]" />
        </div>
      </div>
    </div>
  );
}
