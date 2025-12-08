import { getUsersAppliedFreeCourse } from "@/actions/free-courses/get-users-applied-free-course";
import { AdminDataTable } from "@/app/(admin)/_components/admin-data-table";
import { Card } from "@/components/ui/card";
import { columns } from "./columns";
import { DownloadButton } from "./_components/download-button";

interface Props {
  params: Promise<{
    freeCourseId: string;
  }>;
}

export default async function ApplyPage({ params }: Props) {
  const { freeCourseId } = await params;

  const students = await getUsersAppliedFreeCourse(freeCourseId);

  return (
    <Card className="p-8 space-y-4">
      <div className="flex justify-end">
        <DownloadButton
          data={students.map((student) => ({
            username: student.username ?? "",
            email: student.email ?? "",
            phone: student.phone ?? "",
            appliedAt: student.appliedAt,
            optedIn: student.optedIn,
          }))}
        />
      </div>
      <AdminDataTable
        data={students}
        columns={columns}
        searchPlaceholder="원하는 정보를 검색해보세요."
      />
    </Card>
  );
}
