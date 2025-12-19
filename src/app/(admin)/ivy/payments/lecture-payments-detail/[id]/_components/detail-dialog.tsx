'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { dateTimeFormat } from '@/utils/formats';
import { useEffect, useState } from 'react';
import { getUserById } from '../_actions/get-user-by-id';

interface DetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string | null;
}

export function DetailDialog({ open, onOpenChange, userId }: DetailDialogProps) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && userId) {
            setLoading(true);
            getUserById(userId)
                .then(setUser)
                .finally(() => setLoading(false));
        }
    }, [open, userId]);

    if (!user && !loading) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>회원정보</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">로딩 중...</div>
                ) : user ? (
                    <div className="space-y-4 py-2">
                        <Card>
                            <CardContent className="grid grid-cols-[130px_1fr] gap-y-2 gap-x-6 py-6 text-sm">
                                <div className="font-medium text-muted-foreground">이름</div>
                                <div className="truncate break-all">{user.username}</div>

                                <div className="font-medium text-muted-foreground">가입일</div>
                                <div>{dateTimeFormat(user.createdAt)}</div>

                                <div className="font-medium text-muted-foreground">전화번호</div>
                                <div>{user.phone || '-'}</div>

                                <div className="font-medium text-muted-foreground">이메일</div>
                                <div className="truncate">{user.email || '-'}</div>
                            </CardContent>
                        </Card>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
