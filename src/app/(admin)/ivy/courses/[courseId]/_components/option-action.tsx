'use client';

import { Button } from '@/components/ui/button';
import { FormLabel } from '@/components/ui/form';
import { toast } from 'sonner';
import { addOption, deleteOption, getOptions } from '../actions/option-actions';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useOptionModal } from '@/store/use-option-modal';
import { formatPrice } from '@/utils/formats';
import { OptionModal } from './option-modal';

interface Props {
    courseId: string;
}

type OptionsKey = readonly ['options', string];

export function OptionAction({ courseId }: Props) {
    const [deleteOptionId, setDeleteOptionId] = useState<string | null>(null);
    const { onOpenModal } = useOptionModal();

    const queryClient = useQueryClient();
    const optionsKey: OptionsKey = ['options', courseId] as const;

    const { data: options, isLoading } = useQuery({
        queryKey: optionsKey,
        queryFn: () => getOptions(courseId),
        refetchOnWindowFocus: false,
    });

    const { mutate: mutateAddOption, isPending: isAdding } = useMutation({
        mutationFn: addOption,
        onSuccess: async () => {
            await queryClient.refetchQueries({ queryKey: optionsKey });
            toast.success('옵션이 추가되었습니다.');
        },
        onError: () => toast.error('옵션 추가에 실패했습니다.'),
    });

    const { mutate: mutateDeleteOption, isPending: isDeletingAny } = useMutation({
        mutationFn: deleteOption,
        onSuccess: async () => {
            await queryClient.refetchQueries({ queryKey: optionsKey });
            toast.success('옵션이 삭제되었습니다.');
        },
        onError: () => toast.error('옵션 삭제에 실패했습니다.'),
        onSettled: () => setDeleteOptionId(null),
    });

    return (
        <div>
            <OptionModal courseId={courseId} />

            <div className="flex items-center justify-between mb-3">
                <FormLabel>강의 옵션</FormLabel>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => mutateAddOption(courseId)}
                    disabled={isAdding}
                    className="min-w-16"
                >
                    {isAdding ? <Loader2 className="animate-spin" /> : '옵션 추가'}
                </Button>
            </div>

            <div className="space-y-2">
                {isLoading ? (
                    <div className="space-y-1">
                        <Skeleton className="h-10 animate-pulse" />
                        <Skeleton className="h-10 animate-pulse" />
                    </div>
                ) : options && options.length > 0 ? (
                    options.map((option: any) => {
                        const isDeleting = deleteOptionId === option.id;

                        return (
                            <div key={option.id} className="flex items-stretch gap-x-2 text-sm">
                                <div className="flex-1 border rounded-lg py-1 px-2 flex items-center bg-slate-50 truncate">
                                    {option.name}
                                </div>

                                <div className="flex-1 border rounded-lg py-1 px-2 flex items-center bg-slate-50 truncate">
                                    {formatPrice(Number(option.originalPrice ?? 0))}원
                                </div>

                                <div className="flex-1 border rounded-lg py-1 px-2 flex items-center bg-slate-50 truncate">
                                    {option.discountedPrice != null && option.discountedPrice !== ''
                                        ? `${formatPrice(Number(option.discountedPrice))}원`
                                        : ''}
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => onOpenModal(option.id)}
                                >
                                    <Edit />
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                        if (confirm('정말 삭제하시겠습니까?')) {
                                            setDeleteOptionId(option.id);
                                            mutateDeleteOption(option.id);
                                        }
                                    }}
                                    disabled={isDeleting || isDeletingAny}
                                >
                                    {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
                                </Button>
                            </div>
                        );
                    })
                ) : (
                    <div className="h-20 border border-dashed rounded-md flex items-center justify-center text-xs text-zinc-500">
                        옵션을 추가해주세요.
                    </div>
                )}
            </div>
        </div>
    );
}
