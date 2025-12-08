import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { AdminDataTable } from "@/app/(admin)/_components/admin-data-table";
import { columns } from "./columns";

export default async function CoursesEnrollmentsPage() {
  const enrollments = await db.enrollment.findMany({
    include: {
      course: true,
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">강의 등록 관리</h1>
        <Button asChild>
          <Link href="/admin/courses/enrollments/enroll">수동 등록하기</Link>
        </Button>
      </div>
      <Card className="p-8">
        <AdminDataTable
          columns={columns}
          data={enrollments}
          searchPlaceholder="정보를 검색해보세요."
        />
      </Card>
    </div>
  );
}
