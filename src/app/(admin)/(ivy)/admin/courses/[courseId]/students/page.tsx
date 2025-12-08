import { AdminDataTable } from "@/app/(admin)/_components/admin-data-table";
import { Card } from "@/components/ui/card";
import { columns } from "./columns";
import { getEnrolledUsers } from "@/actions/users/get-enrolled-users";
import { BulkEditButton } from "./_components/bulk-edit-button";

interface Props {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function StudentsPage({ params }: Props) {
  const { courseId } = await params;

  const students = await getEnrolledUsers({ courseId });

  return (
    <Card className="p-8 space-y-4">
      <div className="flex justify-end">
        <BulkEditButton courseId={courseId} />
      </div>
      <AdminDataTable
        data={students}
        columns={columns}
        searchPlaceholder="원하는 정보를 검색해보세요."
      />
    </Card>
  );
}
