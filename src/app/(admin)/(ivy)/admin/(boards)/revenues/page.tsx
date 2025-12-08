import Link from "next/link";
import { db } from "@/lib/db";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { AdminDataTable } from "@/app/(admin)/_components/admin-data-table";
import { columns } from "./columns";

export default async function AdminRevenuesPage() {
  const revenues = await db.revenue.findMany({
    where: {},
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">전체 수익인증</h1>
        <Button asChild>
          <Link href="/admin/boards/revenues/new">글쓰기</Link>
        </Button>
      </div>
      <Card className="p-8">
        <AdminDataTable
          columns={columns}
          data={revenues}
          searchPlaceholder="정보를 검색해보세요."
        />
      </Card>
    </div>
  );
}
