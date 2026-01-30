'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
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
import { Checkbox } from '@/components/ui/checkbox';
import { formatPrice } from '@/utils/formats';
import { manualRefundAction } from '../actions';
import type { LecturePaymentDetailRow } from '../actions';

const manualRefundSchema = z.object({
    cancelReason: z.string().optional(),
    cancelAmount: z.string().optional(),
    keepEnrollment: z.boolean().default(false),
});

type ManualRefundFormData = z.infer<typeof manualRefundSchema>;

export function ManualRefundButton({ row }: { row: { original: LecturePaymentDetailRow } }) {
    const r = row.original;
    const router = useRouter();
    const [open, setOpen] = useState(false);

    // 환불 가능액 계산 (UI 표시용)
    const refundableDisplayAmount = useMemo(() => {
        return Math.max(0, (r.paidAmount ?? 0) - (r.refundAmount ?? 0));
    }, [r.paidAmount, r.refundAmount]);

    const form = useForm<ManualRefundFormData>({
        resolver: zodResolver(manualRefundSchema),
        defaultValues: {
            cancelReason: '',
            cancelAmount: '',
            keepEnrollment: false,
        },
    });

    const onSubmit = async (values: ManualRefundFormData) => {
        try {
            const result = await manualRefundAction({
                paymentId: r.paymentId,
                orderId: r.orderId,
                userId: r.userId ?? '',
                courseId: r.courseId,
                // ✅ 사유 미입력 시 '단순 변심' 자동 처리
                cancelReason: values.cancelReason || '단순 변심',
                // ✅ 금액 미입력 시 서버에서 전액 처리
                cancelAmount: values.cancelAmount ? Number(values.cancelAmount) : undefined,
                keepEnrollment: values.keepEnrollment,
            });

            if (!result.success) throw new Error(result.message);

            toast.success('환불 처리가 완료되었습니다.');
            setOpen(false);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || '처리 중 오류 발생');
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="destructive"
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700"
                >
                    <span className="text-xs font-bold">환불</span>
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>현금 결제 환불</AlertDialogTitle>
                    <AlertDialogDescription>
                        입력 없이 진행 시 <strong>전액 환불</strong> 및 <strong>수강권 회수</strong>
                        가 자동으로 수행됩니다.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* 환불 사유 */}
                        <FormField
                            control={form.control}
                            name="cancelReason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-semibold">
                                        환불 사유
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="미입력 시 '단순 변심' 처리"
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* 환불 금액 */}
                        <FormField
                            control={form.control}
                            name="cancelAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-semibold">
                                        환불 금액
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder={`미입력 시 ${formatPrice(
                                                refundableDisplayAmount
                                            )} 전액`}
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* 수강 권한 유지 (체크 안하면 삭제) */}
                        <FormField
                            control={form.control}
                            name="keepEnrollment"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-orange-50/50 border-orange-200">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="text-sm font-bold text-orange-700 cursor-pointer">
                                            수강 권한 유지하기
                                        </FormLabel>
                                        <FormDescription className="text-[11px] text-orange-600/80">
                                            체크하지 않으면 환불 완료 후 수강 권한이{' '}
                                            <strong>자동 삭제</strong>됩니다.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <AlertDialogFooter className="pt-2">
                            <AlertDialogCancel type="button" className="text-xs">
                                취소
                            </AlertDialogCancel>
                            <Button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                                className="bg-orange-600 hover:bg-orange-700 min-w-[100px]"
                            >
                                {form.formState.isSubmitting ? (
                                    <Loader2 className="animate-spin size-4" />
                                ) : (
                                    '환불 확정'
                                )}
                            </Button>
                        </AlertDialogFooter>
                    </form>
                </Form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
