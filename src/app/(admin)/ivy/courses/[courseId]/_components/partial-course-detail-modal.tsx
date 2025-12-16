'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Props {
    data: {
        id: string;
        title: string;
        originalPrice: number | null;
        createdAt: Date;
        isHidden: boolean;
    };
}

export function PartialCourseDetailModal({ data }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                상세
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogTitle>분할 결제 옵션 상세</DialogTitle>

                    <div className="space-y-3 mt-4 text-sm">
                        <p>
                            <strong>ID:</strong> {data.id}
                        </p>
                        <p>
                            <strong>제목:</strong> {data.title}
                        </p>
                        <p>
                            <strong>가격:</strong> {data.originalPrice?.toLocaleString() ?? '-'}원
                        </p>
                        <p>
                            <strong>생성일:</strong> {new Date(data.createdAt).toLocaleString()}
                        </p>
                        <p>
                            <strong>숨김 여부:</strong> {data.isHidden ? '숨김됨' : '표시됨'}
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
