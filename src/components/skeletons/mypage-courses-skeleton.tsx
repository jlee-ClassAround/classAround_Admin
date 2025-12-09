import { Skeleton } from "@/components/ui/skeleton";

export function CurrentCoursesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8 mt-5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-y-3">
          {/* 썸네일 */}
          <Skeleton className="w-full aspect-video rounded-lg" />

          {/* 콘텐츠 */}
          <div className="space-y-4">
            {/* 상태 표시 */}
            <div className="flex items-center gap-x-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>

            {/* 카테고리 */}
            <Skeleton className="h-6 w-20 rounded-md" />

            {/* 강사명 */}
            <Skeleton className="h-4 w-24" />

            {/* 제목 */}
            <Skeleton className="h-6 w-full" />

            {/* 프로그레스 바 */}
            <Skeleton className="h-1 w-full" />

            {/* 수강기간 & 진도율 */}
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>

            {/* 버튼 */}
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
