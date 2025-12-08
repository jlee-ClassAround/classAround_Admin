import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCourseIdHeaderSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between mb-6 items-start">
        <div className="flex items-center gap-x-5">
          {/* Thumbnail */}
          <Skeleton className="h-[90px] w-[160px] rounded-lg" />

          <div className="flex flex-col gap-y-5">
            {/* Title */}
            <Skeleton className="h-8 w-[300px]" />

            {/* Tab Menu */}
            <div className="flex items-center gap-x-5">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>

        {/* Preview Button */}
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}
