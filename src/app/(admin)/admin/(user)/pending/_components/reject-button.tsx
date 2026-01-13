'use client';

import { Button } from '@/components/ui/button';

interface RejectButtonProps {
    userId: string;
    action: (formData: FormData) => void;
}

export function RejectButton({ userId, action }: RejectButtonProps) {
    return (
        <form
            action={action}
            onSubmit={(e) => {
                if (!confirm('해당 가입 요청을 거절하고 삭제할까요?')) {
                    e.preventDefault();
                }
            }}
        >
            <input type="hidden" name="userId" value={userId} />
            <Button size="sm" variant="destructive">
                거절
            </Button>
        </form>
    );
}
