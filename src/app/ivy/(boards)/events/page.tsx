import Link from 'next/link';
import { ivyDb } from '@/lib/ivyDb';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { columns } from './columns';
import { AdminDataTable } from '@/components/admin-data-table';

export default async function AdminEventPage() {
    const events = await ivyDb.event.findMany({
        where: {},
        orderBy: {
            createdAt: 'desc',
        },
    });

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">모든 이벤트</h1>
                <Button asChild>
                    <Link href="/ivy/boards/events/new">글쓰기</Link>
                </Button>
            </div>
            <Card className="p-8">
                <AdminDataTable
                    columns={columns}
                    data={events}
                    searchKey="title"
                    searchPlaceholder="제목을 검색해보세요."
                />
            </Card>
        </div>
    );
}
