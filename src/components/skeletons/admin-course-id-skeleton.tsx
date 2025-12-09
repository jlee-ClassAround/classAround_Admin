import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCourseIdSkeleton() {
  return (
    <div className="space-y-6">
      {/* Main Content */}
      <Card className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Left Column */}
          <div className="space-y-6 md:col-span-3">
            <div className="space-y-4">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-4">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-32 w-full" />
            </div>

            <div className="space-y-4">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-4">
              <Skeleton className="h-4 w-[100px]" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 md:col-span-2">
            <div className="space-y-4">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-[200px] w-full rounded-lg" />
            </div>

            <div className="space-y-4">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-4">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-4">
              <Skeleton className="h-4 w-[100px]" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-[100px]" />
                <Skeleton className="h-8 w-[60px]" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
