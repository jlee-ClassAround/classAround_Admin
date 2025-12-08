import { getEnrolledCourses } from "@/actions/courses/get-enrolled-courses";
import { AdminDataTable } from "@/app/(admin)/_components/admin-data-table";
import { Card } from "@/components/ui/card";
import { columns } from "./columns";

interface Props {
  params: Promise<{
    userId: string;
  }>;
}

export default async function CoursesPage({ params }: Props) {
  const { userId } = await params;
  const enrolledCourses = await getEnrolledCourses({ userId });

  return (
    <Card className="p-8">
      <AdminDataTable
        columns={columns}
        data={enrolledCourses}
        searchPlaceholder="정보를 검색해보세요."
      />
    </Card>
  );
}
