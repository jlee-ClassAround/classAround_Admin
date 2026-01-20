'use client';

import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { dateFormat, formatPrice } from '@/utils/formats';

import { DetailDialog } from './_components/detail-dialog';
import { RefundButton } from './_components/refund-button';
import { getPaymentMethodToKr } from '../../lecture-payments/utils/get-enum-to-kr';
import { ReceiptText } from 'lucide-react';
import { ManualRefundButton } from './_components/manual-refund-button';
import { PaymentLogDialog } from './_components/payment-log-dialog';
import { LecturePaymentDetailRow } from './actions';

function paymentStatusLabel(status: string): { label: string; className: string } {
    switch (status) {
        case 'DONE':
            return { label: '결제완료', className: 'text-green-500 bg-green-500/10' };
        case 'CANCELED':
            return { label: '환불됨', className: 'text-red-500 bg-red-500/10' };
        case 'PARTIAL_CANCELED':
            return { label: '부분환불', className: 'text-orange-500 bg-orange-500/10' };
        case 'WAITING_FOR_DEPOSIT':
            return { label: '입금대기', className: 'text-yellow-500 bg-yellow-500/10' };
        case 'WAITING_FOR_DIRECT_DEPOSIT':
            return { label: '입금확인대기', className: 'text-yellow-500 bg-yellow-500/10' };
        case 'FAILED':
            return { label: '실패', className: 'text-muted-foreground bg-muted-foreground/10' };
        case 'READY':
        default:
            return { label: '결제대기', className: 'text-gray-500 bg-gray-500/10' };
    }
}

export const columns: ColumnDef<LecturePaymentDetailRow>[] = [
    {
        accessorKey: 'buyerName',
        meta: { label: '구매자' },
        header: ({ column }) => <DataTableColumnHeader column={column} title="구매자" />,
        cell: ({ row }) => {
            const [open, setOpen] = useState(false);
            const data = row.original;

            return (
                <>
                    <button
                        onClick={() => setOpen(true)}
                        className="text-xs hover:text-primary hover:underline cursor-pointer truncate max-w-full"
                    >
                        {data.buyerName || '-'}
                    </button>

                    <DetailDialog open={open} onOpenChange={setOpen} userId={data.userId ?? ''} />
                </>
            );
        },
    },
    {
        accessorKey: 'buyerPhone',
        meta: { label: '전화번호' },
        header: ({ column }) => <DataTableColumnHeader column={column} title="전화번호" />,
        cell: ({ row }) => (
            <div className="max-w-[120px] truncate text-xs">{row.original.buyerPhone || '-'}</div>
        ),
    },
    {
        accessorKey: 'buyerEmail',
        meta: { label: '이메일' },
        header: ({ column }) => <DataTableColumnHeader column={column} title="이메일" />,
        cell: ({ row }) => (
            <div className="max-w-[160px] truncate text-xs">{row.original.buyerEmail || '-'}</div>
        ),
    },
    {
        accessorKey: 'paidAt',
        meta: { label: '결제일' },
        header: ({ column }) => <DataTableColumnHeader column={column} title="결제일" />,
        cell: ({ row }) => (
            <div className="max-w-[120px] text-start text-xs truncate">
                {dateFormat(row.original.paidAt)}
            </div>
        ),
    },
    {
        accessorKey: 'paymentMethod',
        meta: { label: '결제수단' },
        header: ({ column }) => <DataTableColumnHeader column={column} title="결제수단" />,
        cell: ({ row }) => {
            const method = String(row.original.paymentMethod);
            const label = getPaymentMethodToKr(row.original.paymentMethod);
            return <Badge variant="secondary">{label || method}</Badge>;
        },
    },
    {
        accessorKey: 'netAmount',
        meta: { label: '결제 금액' },
        header: ({ column }) => <DataTableColumnHeader column={column} title="결제 금액" />,
        cell: ({ row }) => (
            <div className="max-w-[120px] text-start text-xs truncate font-medium">
                {formatPrice(row.original.netAmount)}
            </div>
        ),
    },
    {
        accessorKey: 'paymentStatus',
        meta: { label: '결제 상태' },
        header: ({ column }) => <DataTableColumnHeader column={column} title="결제 상태" />,
        cell: ({ row }) => {
            const { label, className } = paymentStatusLabel(String(row.original.paymentStatus));
            return (
                <Badge variant="secondary" className={cn('rounded-full', className)}>
                    {label}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'orderStatus',
        meta: { label: '주문 상태' },
        header: ({ column }) => <DataTableColumnHeader column={column} title="주문 상태" />,
        cell: ({ row }) => (
            <div className="max-w-[140px] truncate text-xs">{String(row.original.orderStatus)}</div>
        ),
    },
    {
        id: 'actions',
        meta: { label: '처리' },
        header: ({ column }) => <DataTableColumnHeader column={column} title="처리" />,
        cell: ({ row }) => {
            const data = row.original;
            const status = String(data.paymentStatus ?? '');

            if (status === 'CANCELED' || status === 'REFUNDED') {
                return <div className="text-xs text-muted-foreground">-</div>;
            }

            if (data.paymentMethod === 'TRANSFER') {
                return <ManualRefundButton row={row} />;
            }

            return <RefundButton row={row} />;
        },
    },
    {
        id: 'detail', // ✅ 컬럼 ID를 더 범용적인 이름으로 변경 (선택사항)
        meta: { label: '상세' },
        header: ({ column }) => <DataTableColumnHeader column={column} title="상세" />,
        cell: ({ row }) => {
            const [isLogOpen, setIsLogOpen] = useState(false);
            const data = row.original;

            // 1. 토스 결제 등 영수증 URL이 있는 경우 (기존 로직)
            if (data.receiptUrl) {
                return (
                    <a
                        href={data.receiptUrl}
                        target="_blank"
                        className="p-1 hover:text-primary"
                        title="영수증 보기"
                    >
                        <ReceiptText className="w-4 h-4 text-muted-foreground" />
                    </a>
                );
            }

            // 2. 계좌이체(TRANSFER) 등 수동 결제건인 경우 상세 로그 모달 노출
            if (data.paymentMethod === 'TRANSFER') {
                return (
                    <>
                        <button
                            onClick={() => setIsLogOpen(true)}
                            className="p-1 hover:text-primary cursor-pointer"
                            title="결제 이력 로그"
                        >
                            <ReceiptText className="w-4 h-4 text-muted-foreground" />
                        </button>

                        {/* ✅ 결제 이력을 보여주는 상세 로그 모달 */}
                        <PaymentLogDialog
                            open={isLogOpen}
                            onOpenChange={setIsLogOpen}
                            orderId={data.orderId}
                        />
                    </>
                );
            }

            return null;
        },
    },
];
