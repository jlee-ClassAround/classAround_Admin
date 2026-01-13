'use client';

import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

import { dateTimeFormat, formatPrice } from '@/utils/formats';
import { TossCustomer } from '@/generated/ivy';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { refundPaymentAction } from './actions';

interface ExtendedTossCustomer extends TossCustomer {
    course?: { title: string } | null;
    ebook?: { title: string } | null;
    user?: { username: string; phone: string; email: string } | null;
}

export const columns: ColumnDef<ExtendedTossCustomer>[] = [
    {
        accessorKey: 'course.title',
        meta: {
            label: '상품명',
        },
        header: ({ column }) => <DataTableColumnHeader column={column} title={'상품명'} />,
        cell: ({ row }) => {
            const data = row.original;
            return (
                <div className="max-w-[300px] truncate text-xs">
                    {data.course?.title || data.ebook?.title || '-'}
                </div>
            );
        },
    },
    {
        accessorKey: 'user.username',
        meta: {
            label: '구매자',
        },
        header: ({ column }) => <DataTableColumnHeader column={column} title="구매자" />,
        cell: ({ row }) => {
            const data = row.original;
            return <div className="truncate text-xs">{data.user?.username || '-'}</div>;
        },
    },
    {
        accessorKey: 'user.phone',
        meta: {
            label: '전화번호',
        },
        header: ({ column }) => <DataTableColumnHeader column={column} title="전화번호" />,
        cell: ({ row }) => {
            const data = row.original;
            return <div className="truncate text-xs">{data.user?.phone || '-'}</div>;
        },
    },
    {
        accessorKey: 'user.email',
        meta: {
            label: '이메일',
        },
        header: ({ column }) => <DataTableColumnHeader column={column} title="이메일" />,
        cell: ({ row }) => {
            const data = row.original;
            return <div className="truncate text-xs">{data.user?.email || '-'}</div>;
        },
    },
    {
        accessorKey: 'productType',
        meta: {
            label: '상품 유형',
        },
        header: ({ column }) => <DataTableColumnHeader column={column} title="상품 유형" />,
        cell: ({ row }) => {
            const data = row.original;
            return (
                <Badge variant={data.productType === 'COURSE' ? 'default' : 'secondary'}>
                    {data.productType === 'COURSE' ? '강의' : '전자책'}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'isTaxFree',
        meta: {
            label: '세금 유형',
        },
        header: ({ column }) => <DataTableColumnHeader column={column} title="세금 유형" />,
        cell: ({ row }) => {
            const data = row.original;
            return (
                <Badge variant={'secondary'} className="rounded-full">
                    {data.isTaxFree ? '면세' : '과세'}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'finalPrice',
        meta: {
            label: '결제 금액',
        },
        header: ({ column }) => <DataTableColumnHeader column={column} title="결제 금액" />,
        cell: ({ row }) => {
            const data = row.original;
            return (
                <div className="text-center text-xs truncate font-medium">
                    {formatPrice(data.finalPrice)}
                </div>
            );
        },
    },
    {
        accessorKey: 'createdAt',
        meta: {
            label: '결제일',
        },
        header: ({ column }) => (
            <div className="flex justify-center">
                <DataTableColumnHeader column={column} title="결제일" />
            </div>
        ),
        cell: ({ row }) => (
            <div className="w-full text-center text-xs truncate">
                {dateTimeFormat(row.original.createdAt)}
            </div>
        ),
    },
    {
        accessorKey: 'paymentStatus',
        meta: {
            label: '결제 상태',
        },
        header: ({ column }) => <DataTableColumnHeader column={column} title="결제 상태" />,
        cell: ({ row }) => {
            const data = row.original;
            const status = row.getValue('paymentStatus');
            let label = '결제완료';
            let style = 'text-green-500 bg-green-500/10';

            switch (status) {
                case 'CANCELLED':
                    label = '취소됨';
                    style = 'text-muted-foreground bg-muted-foreground/10';
                    break;
                case 'REFUNDED':
                    label = '환불됨';
                    style = 'text-red-500 bg-red-500/10';
                    break;
                case 'PARTIAL_REFUNDED':
                    label = '부분환불';
                    style = 'text-red-500 bg-red-500/10';
                    break;
            }

            return (
                <Badge variant="secondary" className={cn('rounded-full', style)}>
                    {label}
                </Badge>
            );
        },
    },
    {
        id: 'actions',
        meta: {
            label: '환불',
        },
        cell: ({ row }) => <RefundAction row={row} />,
    },
    {
        accessorKey: 'cancelAmount',
        meta: {
            label: '환불 금액',
        },
        header: ({ column }) => <DataTableColumnHeader column={column} title="환불 금액" />,
        cell: ({ row }) => {
            const data = row.original.cancelAmount;
            if (data) {
                return <div className="text-start text-xs truncate">{formatPrice(data)}</div>;
            }
            return null;
        },
    },
    {
        accessorKey: 'receiptUrl',
        meta: {
            label: '영수증',
        },
        header: ({ column }) => <DataTableColumnHeader column={column} title="영수증" />,
        cell: ({ row }) => {
            const data = row.original.receiptUrl;
            if (data) {
                return (
                    <a
                        href={`${data}`}
                        target="_blank"
                        className="text-xs hover:text-primary underline"
                    >
                        영수증 보기
                    </a>
                );
            }
            return null;
        },
    },
];

function RefundAction({ row }: { row: Row<TossCustomer> }) {
    const payment = row.original;
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelAmount, setCancelAmount] = useState('');
    const [isKeepEnrollment, setIsKeepEnrollment] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const isDeleting = deletingId === payment.id;

    const handleRefund = async () => {
        try {
            setDeletingId(payment.id);
            const result = await refundPaymentAction({
                paymentId: payment.id,
                cancelReason,
                cancelAmount,
                isKeepEnrollment,
            });

            if (!result.success) {
                toast.error(result.error);
                return;
            }

            toast.success('환불이 완료되었습니다.');
            router.refresh();
        } catch (error) {
            toast.error('환불 처리 중 오류가 발생했습니다.');
        } finally {
            setDeletingId(null);
        }
    };

    if (payment.finalPrice === 0) {
        return null;
    }
    if (payment.paymentStatus === 'REFUNDED' && payment.refundableAmount === 0) {
        return null;
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="destructive"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => setOpen(true)}
                >
                    {isDeleting ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <span className="text-xs">환불</span>
                    )}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="space-y-4">
                <AlertDialogHeader>
                    <AlertDialogTitle>환불 처리</AlertDialogTitle>
                    <AlertDialogDescription>
                        정말 환불하시겠습니까? 환불 처리 후 되돌릴 수 없습니다.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <Label>환불 사유</Label>
                        <Input
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                        />
                        <p className="text-xs text-gray-500">
                            입력하지 않으면 기본 취소 사유로 처리됩니다. {'('}구매자가 취소를 원함
                            {')'}
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>환불 금액</Label>
                        <Input
                            value={cancelAmount}
                            onChange={(e) => setCancelAmount(e.target.value)}
                        />
                        <p className="text-xs text-gray-500">
                            입력하지 않으면 전체 금액이 환불됩니다.
                        </p>
                        <p className="text-xs text-gray-500">
                            환불 가능 금액:{' '}
                            {formatPrice(payment.refundableAmount ?? payment.finalPrice)}
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-x-2">
                            <Label>수강 권한 유지 여부</Label>
                            <Checkbox
                                checked={isKeepEnrollment}
                                onCheckedChange={(value) => setIsKeepEnrollment(Boolean(value))}
                            />
                        </div>
                        <p className="text-xs text-gray-500">체크하면 수강권한이 유지됩니다.</p>
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => {
                            if (confirm('정말 환불하시겠습니까?')) {
                                handleRefund();
                            }
                        }}
                        className="bg-red-500 hover:bg-red-600"
                    >
                        환불
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
