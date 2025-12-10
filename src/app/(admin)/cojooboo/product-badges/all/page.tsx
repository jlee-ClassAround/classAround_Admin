import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cojoobooDb } from '@/lib/cojoobooDb';
import Link from 'next/link';
import { columns } from './columns';
import { AdminDataTable } from '@/components/admin-data-table';

export default async function ProductBadgesPage() {
    const badges = await cojoobooDb.productBadge.findMany({
        orderBy: {
            createdAt: 'desc',
        },
    });

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">모든 배지</h1>
                <Button asChild>
                    <Link href="/cojooboo/product-badges/create">배지 만들기</Link>
                </Button>
            </div>
            <Card className="p-8">
                <AdminDataTable
                    columns={columns}
                    data={badges}
                    searchPlaceholder="배지명을 검색해보세요."
                />
            </Card>
        </div>
    );
}
