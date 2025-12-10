import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cojoobooDb } from '@/lib/cojoobooDb';
import Link from 'next/link';
import { couponColumns } from './columns';
import { AdminDataTable } from '@/components/admin-data-table';

export default async function Coupons() {
    const coupons = await cojoobooDb.coupon.findMany({
        orderBy: {
            createdAt: 'desc',
        },
    });

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">모든 쿠폰</h1>
                <Button asChild>
                    <Link href="/cojooboo/coupons/create">쿠폰 만들기</Link>
                </Button>
            </div>
            <Card className="p-8">
                <AdminDataTable
                    columns={couponColumns}
                    data={coupons}
                    searchKey="name"
                    searchPlaceholder="쿠폰명을 검색해보세요."
                />
            </Card>
        </div>
    );
}
