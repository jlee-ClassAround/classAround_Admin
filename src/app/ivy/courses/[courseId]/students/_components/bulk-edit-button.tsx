'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Calendar, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { updateEnrollmentEndDates } from '../_actions/update-enrollment-end-dates';
import { DatePickerComponent } from '@/components/global/date-picker-component';

interface BulkEditButtonProps {
    courseId: string;
}

export function BulkEditButton({ courseId }: BulkEditButtonProps) {
    const [open, setOpen] = useState(false);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [isUpdatingDates, setIsUpdatingDates] = useState(false);

    const handleBulkUpdateEndDates = async () => {
        if (!endDate) {
            toast.error('만료일자를 입력해주세요.');
            return;
        }

        if (
            !confirm(
                '만료일자를 수정하시겠습니까? 이 작업은 취소할 수 없습니다. 모든 수강생의 만료일자가 변경됩니다.'
            )
        ) {
            return;
        }
        try {
            setIsUpdatingDates(true);

            const result = await updateEnrollmentEndDates({
                courseId,
                endDate: endDate,
            });

            if (result.success) {
                toast.success(`${result.updatedCount}명의 만료일자가 수정되었습니다.`);
                setOpen(false);
                setEndDate(null);
                // 페이지 새로고침
                window.location.reload();
            } else {
                toast.error(result.error || '만료일자 수정 중 오류가 발생했습니다.');
            }
        } catch (error) {
            toast.error('만료일자 수정 중 오류가 발생했습니다.');
        } finally {
            setIsUpdatingDates(false);
        }
    };

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(true)}
                className="flex items-center gap-x-1"
            >
                <Calendar className="size-4" />
                만료일자 일괄 수정
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>만료일자 일괄 수정</DialogTitle>
                        <DialogDescription>
                            모든 수강생의 만료일자를 일괄적으로 수정합니다.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-y-2">
                        <Label>만료일자</Label>
                        <DatePickerComponent
                            value={endDate}
                            onChange={(date) => setEndDate(date)}
                        />
                        <p className="text-xs text-muted-foreground">
                            선택한 날짜로 모든 수강생의 만료일자가 변경됩니다.
                        </p>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">취소</Button>
                        </DialogClose>

                        <Button
                            disabled={isUpdatingDates || !endDate}
                            onClick={handleBulkUpdateEndDates}
                        >
                            {isUpdatingDates ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                '수정하기'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
