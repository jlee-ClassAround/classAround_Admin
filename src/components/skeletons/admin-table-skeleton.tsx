import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminTableSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
      <Card className="p-8">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-[250px]" />
          </div>

          {/* Table Header */}
          <div className="border rounded-md">
            <div className="grid grid-cols-5 gap-4 p-4 bg-slate-50/80">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>

            {/* Table Rows */}
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-5 gap-4 p-4 border-t items-center"
              >
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
