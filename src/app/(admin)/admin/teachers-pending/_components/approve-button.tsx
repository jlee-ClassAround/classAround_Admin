'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';

import { approveAdminAction } from '../actions';
import { toast } from 'sonner';

type ApproveButtonProps = {
    teacherId: string;
};

export function ApproveButton({ teacherId }: ApproveButtonProps) {
    const router = useRouter();

    const [isPending, startTransition] = useTransition();

    return (
        <Button
            size="sm"
            className="bg-green-500 hover:bg-green-600"
            disabled={isPending}
            type="button"
            onClick={() => {
                startTransition(async () => {
                    const fd = new FormData();
                    fd.set('teacherId', teacherId);

                    const res = await approveAdminAction(fd);

                    if (!res.ok) {
                        toast.success('승인되었습니다.');
                        return;
                    }

                    router.refresh();
                });
            }}
        >
            승인
        </Button>
    );
}
