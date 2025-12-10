import { Card } from '@/components/ui/card';
import { columns } from './columns';
import { AdminDataTable } from '@/components/admin-data-table';
import { getUsersAppliedFreeCourse } from '@/app/(admin)/ivy/_actions/free-courses/get-users-applied-free-course';

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
