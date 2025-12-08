import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import Link from "next/link";
import { columns } from "./columns";
import { Card } from "@/components/ui/card";
import { AdminDataTable } from "@/app/(admin)/_components/admin-data-table";

export default async function EbooksAll() {
  const ebooks = await db.ebook.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: true,
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">모든 전자책</h1>
        <Button asChild>
          <Link href="/admin/ebooks/create">전자책 만들기</Link>
        </Button>
      </div>
      <Card className="p-8">
        <AdminDataTable
          columns={columns}
          data={ebooks}
          searchKey="title"
          searchPlaceholder="전자책명을 검색해보세요."
        />
      </Card>
    </div>
  );
}
