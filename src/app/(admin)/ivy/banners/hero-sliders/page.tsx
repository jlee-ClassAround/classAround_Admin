import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ivyDb } from '@/lib/ivyDb';
import Link from 'next/link';
import { columns } from './columns';
import { AdminDataTable } from '@/components/admin-data-table';

export default async function HeroSliders() {
    const sliders = await ivyDb.heroSlider.findMany({
        where: {},
        orderBy: {
            position: 'asc',
        },
    });

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">모든 히어로 슬라이더</h1>
                <Button asChild>
                    <Link href="/ivy/banners/hero-sliders/new">추가하기</Link>
                </Button>
            </div>
            <Card className="p-8">
                <AdminDataTable
                    columns={columns}
                    data={sliders}
                    searchKey="title"
                    searchPlaceholder="제목을 검색해보세요."
                />
            </Card>
        </div>
    );
}
