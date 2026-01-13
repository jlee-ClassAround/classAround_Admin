import { Card } from '@/components/ui/card';
import { AdminDataTable } from '@/components/admin-data-table';

import { getIsSuperAdmin } from '@/utils/auth/is-super-admin';

import { getTeachers } from './actions';
import NotFound from '@/app/(auth)/not-found';
import { columns } from './_components/columns';

interface Props {
    searchParams: Promise<{
        page?: string;
        pageSize?: string;
        search?: string;
        sort?: string;
        order?: 'asc' | 'desc';
    }>;
}

export default async function TeachersPage({ searchParams }: Props) {
    // 1. 권한 체크 (필요시)
    const isSuperAdmin = await getIsSuperAdmin();
    if (!isSuperAdmin) return NotFound();

    const params = await searchParams;
    const currentPage = Number(params.page) || 1;
    const pageSize = Number(params.pageSize) || 50;
    const search = params.search || '';
    const sort = params.sort || 'createdAt';
    const order = params.order || 'desc';

    // 2. 강사 데이터 호출 (승인된 강사만 가져오도록 액션에서 처리)
    const { teachers, totalCount, totalPages, serverSorting } = await getTeachers({
        currentPage,
        pageSize,
        search,
        sort,
        order,
    });

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">강사 관리</h1>
                    <p className="text-sm text-muted-foreground">
                        승인된 강사 목록을 확인하고 관리할 수 있습니다.
                    </p>
                </div>
            </div>
            <Card className="p-8">
                <AdminDataTable
                    columns={columns}
                    data={teachers}
                    searchPlaceholder="강사 이름 또는 이메일로 검색해보세요."
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
