import { cojoobooDb } from '@/lib/cojoobooDb';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

import { columns } from './columns';
import { AdminDataTable } from '@/components/admin-data-table';

export default async function CoursesEnrollmentsPage() {
    const enrollments = await cojoobooDb.enrollment.findMany({
        include: {
            course: true,
            user: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">강의 등록 관리</h1>
                <Button asChild>
                    <Link href="/cojooboo/courses/enrollments/enroll">수동 등록하기</Link>
                </Button>
            </div>
            <Card className="p-8">
                <AdminDataTable
                    columns={columns}
                    data={enrollments}
                    searchPlaceholder="정보를 검색해보세요."
                />
            </Card>
        </div>
    );
}
