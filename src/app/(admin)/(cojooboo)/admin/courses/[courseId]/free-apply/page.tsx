import { getUsersAppliedFreeCourse } from "@/actions/free-courses/get-users-applied-free-course";
import { AdminDataTable } from "@/app/(admin)/_components/admin-data-table";
import { Card } from "@/components/ui/card";
import { columns } from "./columns";

interface Props {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function FreeApplyPage({ params }: Props) {
  const { courseId } = await params;

  const students = await getUsersAppliedFreeCourse(courseId);

  return (
    <Card className="p-8">
      <AdminDataTable
        data={students}
        columns={columns}
        searchPlaceholder="원하는 정보를 검색해보세요."
      />
    </Card>
  );
}
