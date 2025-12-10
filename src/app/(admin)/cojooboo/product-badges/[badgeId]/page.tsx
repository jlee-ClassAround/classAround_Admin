import { Card } from '@/components/ui/card';
import { BadgeForm } from './_components/badge-form';
import { cojoobooDb } from '@/lib/cojoobooDb';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ badgeId: string }>;
}

export default async function BadgePage({ params }: Props) {
    const { badgeId } = await params;
    const badge = await cojoobooDb.productBadge.findUnique({
        where: {
            id: badgeId,
        },
    });

    if (!badge) {
        return notFound();
    }

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-semibold">배지 수정</h1>
            <Card className="p-6">
                <BadgeForm initialData={badge} />
            </Card>
        </div>
    );
}
