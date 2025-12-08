import { Skeleton } from "@/components/ui/skeleton";

export function AdminUserPageHeaderSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-x-3">
        <Skeleton className="size-20 rounded-full" />
        <div className="flex flex-col gap-y-1">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-5 w-48" />
        </div>
      </div>
      <div className="flex items-center gap-x-5">
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}
