'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { optionSchema, type OptionSchema } from '@/lib/cojooboo/schemas';
import { useOptionModal } from '@/store/use-option-modal';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { getOption, updateOption } from '../actions/option-actions';
import { Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface Props {
    courseId: string;
}

type OptionsKey = readonly ['options', string];
type OptionKey = readonly ['option', string | null];

export function OptionModal({ courseId }: Props) {
    const { isModalOpen, selectedOptionId, onCloseModal } = useOptionModal();
    const queryClient = useQueryClient();

    const optionsKey: OptionsKey = ['options', courseId] as const;
    const optionKey: OptionKey = ['option', selectedOptionId] as const;

    const { data: option, isPending } = useQuery({
        queryKey: optionKey,
        queryFn: () => getOption(selectedOptionId),

        enabled: Boolean(isModalOpen && selectedOptionId),
        refetchOnWindowFocus: false,
    });

    const form = useForm<OptionSchema>({
        resolver: zodResolver(optionSchema),
        defaultValues: {
            name: '',
            originalPrice: undefined,
            discountedPrice: undefined,
            isTaxFree: false,
            maxPurchaseCount: undefined,
        },
    });

    const { isSubmitting } = form.formState;

    useEffect(() => {
        form.reset({
            ...option,
            discountedPrice: (option as any)?.discountedPrice ?? undefined,
            maxPurchaseCount: (option as any)?.maxPurchaseCount ?? undefined,
            isTaxFree: Boolean((option as any)?.isTaxFree ?? false),
        });
    }, [option, isModalOpen]);

    const { mutateAsync: updateOptionMutation } = useMutation({
        mutationFn: updateOption,

        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: optionsKey });
            await queryClient.cancelQueries({ queryKey: optionKey });

            const prevOptions = queryClient.getQueryData<any[]>(optionsKey);
            const prevOption = queryClient.getQueryData<any>(optionKey);

            const patch = {
                ...variables.values,

                originalPrice: Number((variables.values as any).originalPrice ?? 0),
                discountedPrice:
                    (variables.values as any).discountedPrice == null
                        ? null
                        : Number((variables.values as any).discountedPrice),
            };

            queryClient.setQueryData(optionKey, (old: any) => {
                if (!old) return old;
                return { ...old, ...patch };
            });

            queryClient.setQueryData(optionsKey, (old: any[]) => {
                const list = old ?? [];
                return list.map((o) => (o.id === variables.optionId ? { ...o, ...patch } : o));
            });

            return { prevOptions, prevOption };
        },

        onError: (_err, _vars, ctx) => {
            if (ctx?.prevOptions) queryClient.setQueryData(optionsKey, ctx.prevOptions);
            if (ctx?.prevOption) queryClient.setQueryData(optionKey, ctx.prevOption);
            toast.error('옵션 수정 실패');
        },

        onSuccess: async () => {
            await queryClient.refetchQueries({ queryKey: optionsKey });
            await queryClient.refetchQueries({ queryKey: optionKey });

            onCloseModal();
            toast.success('옵션 수정 완료');
            form.reset();
        },
    });

    const onSubmit = async (values: OptionSchema) => {
        const processedValues: any = {
            ...values,
            discountedPrice: values.discountedPrice ?? null,
            maxPurchaseCount: values.maxPurchaseCount ?? null,
            isTaxFree: values.isTaxFree ?? false,
            originalPrice: Number(values.originalPrice ?? 0),
        };

        await updateOptionMutation({
            optionId: selectedOptionId ?? '',
            values: processedValues,
        } as any);
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={onCloseModal}>
            <DialogContent>
                {isPending ? (
                    <div className="flex items-center justify-center min-h-[200px]">
                        <Loader2 className="size-10 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <DialogHeader>
                                <DialogTitle>옵션 수정</DialogTitle>
                                <DialogDescription>
                                    옵션 이름, 원가, 할인가를 수정할 수 있습니다.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <FormField
                                    name="name"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>옵션명</FormLabel>
                                            <FormControl>
                                                <Input {...field} disabled={isSubmitting} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    name="originalPrice"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>원가</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={isSubmitting}
                                                    type="number"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    name="discountedPrice"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>할인가</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={isSubmitting}
                                                    type="number"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    name="isTaxFree"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem className="space-y-0 flex items-center justify-between">
                                            <div className="space-y-1">
                                                <FormLabel>세금 설정</FormLabel>
                                                <FormDescription>
                                                    활성화하면 면세 상품으로 처리됩니다.
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    disabled={isSubmitting}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    name="maxPurchaseCount"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>최대 구매 가능 수량</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={isSubmitting}
                                                    type="number"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                            <FormDescription>
                                                입력하지 않으면 구매제한이 사라집니다.
                                            </FormDescription>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        '옵션 수정'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}
