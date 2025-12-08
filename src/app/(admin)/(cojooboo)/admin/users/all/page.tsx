import { AdminDataTable } from "@/app/(admin)/_components/admin-data-table";
import { Card } from "@/components/ui/card";
import { userColumns } from "./columns";
import { DownloadCsvButton } from "./_components/download-csv-button";
import { DownloadAllUsersCsvButton } from "./_components/download-all-users-csv-button";
import { getAllUsers } from "./_actions/get-all-users";

interface Props {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    sort?: string;
    order?: "asc" | "desc";
  }>;
}

export default async function AllUsersPage({ searchParams }: Props) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 50;
  const search = params.search || "";
  const sort = params.sort || "createdAt";
  const order = params.order || "desc";

  const { users, totalCount, totalPages, serverSorting } = await getAllUsers({
    currentPage,
    pageSize,
    search,
    sort,
    order,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">모든 사용자</h1>
      </div>
      <Card className="p-8">
        <div className="flex items-center justify-end gap-2 pb-4">
          <DownloadCsvButton users={users} />
          <DownloadAllUsersCsvButton />
        </div>
        <AdminDataTable
          columns={userColumns}
          data={users}
          searchPlaceholder="원하는 정보를 검색해보세요."
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
