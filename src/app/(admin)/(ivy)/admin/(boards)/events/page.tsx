import Link from "next/link";
import { db } from "@/lib/db";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { AdminDataTable } from "@/app/(admin)/_components/admin-data-table";
import { columns } from "./columns";

export default async function AdminEventPage() {
  const events = await db.event.findMany({
    where: {},
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">모든 이벤트</h1>
        <Button asChild>
          <Link href="/admin/boards/events/new">글쓰기</Link>
        </Button>
      </div>
      <Card className="p-8">
        <AdminDataTable
          columns={columns}
          data={events}
          searchKey="title"
          searchPlaceholder="제목을 검색해보세요."
        />
      </Card>
    </div>
  );
}
