'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { partialCourseSchema, PartialCourseSchema } from '@/lib/cojooboo/schemas';
import axios from 'axios';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { createPartialCourse } from '../actions/create-partial-course';
import { updatePartialCourse } from '../actions/update-partial-course';

interface PartialCourseModalProps {
    mode: 'create' | 'view' | 'edit';
    courseId: string;
    courseTitle?: string;
    initialData?: {
        id: string;
        title: string;
        originalPrice: number | null;
        isHidden: boolean;
    };
    trigger?: React.ReactNode;
}

export function PartialCourseModal({
    mode,
    courseId,
    courseTitle,
    initialData,
    trigger,
}: PartialCourseModalProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const isView = mode === 'view';

    const form = useForm<PartialCourseSchema>({
        resolver: zodResolver(partialCourseSchema),
        defaultValues: {
            title: mode === 'create' ? courseTitle ?? '' : initialData?.title ?? '',
            originalPrice: initialData?.originalPrice ?? 0,
            isHidden: initialData?.isHidden ?? false,
        },
    });

    // Open될 때 데이터 세팅
    useEffect(() => {
        if (open && initialData) {
            form.reset({
                title: initialData.title,
                originalPrice: initialData.originalPrice ?? 0,
                isHidden: initialData.isHidden ?? false,
            });
        }
    }, [open, initialData, form]);

    const onSubmit = async (values: PartialCourseSchema) => {
        try {
            if (mode === 'create') {
                await createPartialCourse({
                    ...values,
                    mainId: courseId,
                });
                toast.success('생성되었습니다.');
            } else if (mode === 'edit' && initialData?.id) {
                await updatePartialCourse(initialData.id, values);
                toast.success('수정되었습니다.');
            }

            setOpen(false);
            router.refresh();
        } catch {
            toast.error('저장 중 오류가 발생했습니다.');
        }
    };

    return (
        <>
            <div onClick={() => setOpen(true)}>{trigger}</div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogTitle>
                        {mode === 'create'
                            ? '분할 결제 옵션 추가'
                            : mode === 'view'
                            ? '분할 결제 옵션 상세'
                            : '분할 결제 옵션 수정'}
                    </DialogTitle>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        {/* 제목 */}
                        <div>
                            <label className="text-sm font-medium">타이틀</label>
                            <Input {...form.register('title')} disabled={isView} />
                        </div>

                        {/* 가격 */}
                        <div>
                            <label className="text-sm font-medium">가격</label>
                            <Input
                                type="number"
                                {...form.register('originalPrice')}
                                disabled={isView}
                            />
                        </div>

                        {/* 숨기기 */}
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={form.watch('isHidden')}
                                onCheckedChange={(v) => form.setValue('isHidden', v)}
                                disabled={isView}
                            />
                            <span>숨기기</span>
                        </div>

                        {/* 버튼 */}
                        {!isView && (
                            <Button className="w-full" type="submit">
                                {mode === 'edit' ? '수정 완료' : '생성하기'}
                            </Button>
                        )}
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
