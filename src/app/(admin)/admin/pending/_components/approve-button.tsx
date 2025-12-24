'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';

import { approveAdminAction } from '../actions';
import { toast } from 'sonner';

type ApproveButtonProps = {
    userId: string;
};

export function ApproveButton({ userId }: ApproveButtonProps) {
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
                    fd.set('userId', userId);

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
