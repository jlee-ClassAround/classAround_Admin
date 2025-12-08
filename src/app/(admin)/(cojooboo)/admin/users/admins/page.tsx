import { AdminDataTable } from "@/app/(admin)/_components/admin-data-table";
import { Card } from "@/components/ui/card";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { userColumns } from "../all/columns";
import { notFound } from "next/navigation";
import { getAdminUsers } from "./_actions/get-admin-users";
import { DownloadCsvButton } from "../all/_components/download-csv-button";
import { getIsSuperAdmin } from "@/utils/auth/is-super-admin";

interface Props {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    sort?: string;
    order?: "asc" | "desc";
  }>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const isSuperAdmin = await getIsSuperAdmin();
  if (!isSuperAdmin) return notFound();

  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 50;
  const search = params.search || "";
  const sort = params.sort || "createdAt";
  const order = params.order || "desc";

  const { users, totalCount, totalPages, serverSorting } = await getAdminUsers({
    currentPage,
    pageSize,
    search,
    sort,
    order,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">관리자 목록</h1>
          <p className="text-sm text-muted-foreground">
            관리자 또는 슈퍼 관리자 권한을 가진 계정을 확인할 수 있습니다.
          </p>
        </div>
        <DownloadCsvButton users={users} />
      </div>
      <Card className="p-8">
        <AdminDataTable
          columns={userColumns}
          data={users}
          searchPlaceholder="관리자 계정을 검색해보세요."
          isServerSide={true}
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          defaultPageSize={pageSize}
          serverSorting={serverSorting}
        />
      </Card>
    </div>
  );
}
