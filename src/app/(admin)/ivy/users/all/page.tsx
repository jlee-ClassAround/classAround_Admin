import { Card } from '@/components/ui/card';
import { ivyDb } from '@/lib/ivyDb';
import { userColumns } from './columns';
import { DownloadCsvButton } from './_components/download-csv-button';
import { AdminDataTable } from '@/components/admin-data-table';

export default async function AllUsersPage() {
    const users = await ivyDb.user.findMany({
        orderBy: {
            createdAt: 'desc',
        },
    });

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">모든 사용자</h1>
            </div>
            <Card className="p-8">
                <div className="flex items-center justify-end pb-4">
                    <DownloadCsvButton users={users} />
                </div>
                <AdminDataTable
                    columns={userColumns}
                    data={users}
                    searchPlaceholder="원하는 정보를 검색해보세요."
                />
            </Card>
        </div>
    );
}
