import { Card } from '@/components/ui/card';
import { TossSyncButton } from '@/components/admin/toss-sync-button';
import { TossReconcileStatusButton } from '@/components/admin/toss-reconcile-status-button';

export default async function DataSyncPage() {
    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">db 싱크 맞추는 곳</h1>
            </div>
            <Card className="p-8">
                <TossSyncButton />
            </Card>
            <Card className="p-8">
                <TossReconcileStatusButton dryRun={false} />
            </Card>
        </div>
    );
}
