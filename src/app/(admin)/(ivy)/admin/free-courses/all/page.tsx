import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import Link from "next/link";
import { columns } from "./columns";
import { Card } from "@/components/ui/card";
import { AdminDataTable } from "@/app/(admin)/_components/admin-data-table";

export default async function CoursesAll() {
  const courses = await db.freeCourse.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">모든 무료 강의</h1>
        <Button asChild>
          <Link href="/admin/free-courses/create">강의 만들기</Link>
        </Button>
      </div>
      <Card className="p-8">
        <AdminDataTable
          columns={columns}
          data={courses}
          searchKey="title"
          searchPlaceholder="강의명을 검색해보세요."
        />
      </Card>
    </div>
  );
}
