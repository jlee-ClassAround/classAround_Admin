import { Skeleton } from "../ui/skeleton";

export function CoursesSwiperSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-3 md:gap-x-5 animate-pulse">
      <div className="flex flex-col gap-y-2">
        <Skeleton className="w-full aspect-video rounded-lg" />
        <Skeleton className="w-full h-6" />
        <Skeleton className="w-40 h-4" />
        <Skeleton className="w-20 h-4" />
      </div>
      <div className="flex-col gap-y-2 hidden md:flex">
        <Skeleton className="w-full aspect-video rounded-lg" />
        <Skeleton className="w-full h-6" />
        <Skeleton className="w-40 h-4" />
        <Skeleton className="w-20 h-4" />
      </div>
      <div className="flex-col gap-y-2 hidden lg:flex">
        <Skeleton className="w-full aspect-video rounded-lg" />
        <Skeleton className="w-full h-6" />
        <Skeleton className="w-40 h-4" />
        <Skeleton className="w-20 h-4" />
      </div>
    </div>
  );
}
