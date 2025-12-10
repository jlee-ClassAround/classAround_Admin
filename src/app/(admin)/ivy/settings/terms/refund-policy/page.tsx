import { Card } from '@/components/ui/card';
import { ivyDb } from '@/lib/ivyDb';
import { RefundForm } from './_components/refund-form';

export default async function RefundPolicyPage() {
    const refundPolicy = await ivyDb.terms.findUnique({
        where: {
            id: 3,
        },
    });

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">환불 정책</h1>
            </div>
            <Card className="p-8">
                <RefundForm initialData={refundPolicy} />
            </Card>
        </div>
    );
}
