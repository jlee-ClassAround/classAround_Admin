import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ivyDb } from '@/lib/ivyDb';
import Link from 'next/link';
import { columns } from './columns';
import { AdminDataTable } from '@/components/admin-data-table';

export default async function AllTeachersPage() {
    const teachers = await ivyDb.teacher.findMany({
        orderBy: {
            name: 'asc',
        },
        include: {
            category: true,
        },
    });

    return (
        <div className="space-y-5">
            <div className="mb-3 flex items-center justify-between">
                <h1 className="text-xl font-semibold">강사 관리</h1>
                <Button asChild>
                    <Link href="/ivy/teachers/create">강사 만들기</Link>
                </Button>
            </div>
            <Card className="p-8">
                <AdminDataTable
                    columns={columns}
                    data={teachers}
                    searchKey="name"
                    searchPlaceholder="강사명을 검색해보세요."
                />
            </Card>
        </div>
    );
}
