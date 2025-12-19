'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ReceiptText } from 'lucide-react';
import { format } from 'date-fns';

export function CashDetailCell({ payment }: { payment: any }) {
    const [open, setOpen] = useState(false);

    const f = (d: any) => (d ? format(new Date(d), 'yyyy-MM-dd HH:mm') : '-');
    const number = (n: any) => (n != null ? n.toLocaleString() + ' 원' : '-');

    const renderStatusBlock = () => {
        switch (payment.paymentStatus) {
            case 'WAIT':
                return (
                    <>
                        <ReceiptRow label="결제상태" value="결제 대기" highlight />
                        <ReceiptRow label="등록일" value={f(payment.createdAt)} />
                        <ReceiptRow label="결제금액" value={number(payment.price)} bold />
                    </>
                );

            case 'COMPLETED':
                return (
                    <>
                        <ReceiptRow label="결제상태" value="결제 완료" highlight />
                        <ReceiptRow label="결제일" value={f(payment.completedAt)} />
                        <ReceiptRow label="결제금액" value={number(payment.price)} bold />
                    </>
                );

            case 'PARTIAL_REFUNDED':
                return (
                    <>
                        <ReceiptRow label="결제상태" value="부분 환불" highlight="yellow" />
                        <ReceiptRow label="결제일" value={f(payment.completedAt)} />
                        <ReceiptRow label="결제금액" value={number(payment.price)} />
                        <ReceiptRow label="환불금액" value={number(payment.cancelAmount)} bold />
                        <ReceiptRow label="환불일" value={f(payment.canceledAt)} />
                    </>
                );

            case 'REFUNDED':
                return (
                    <>
                        <ReceiptRow label="결제상태" value="전액 환불" highlight="red" />
                        <ReceiptRow label="결제일" value={f(payment.completedAt)} />
                        <ReceiptRow label="환불금액" value={number(payment.cancelAmount)} bold />
                        <ReceiptRow label="환불일" value={f(payment.canceledAt)} />
                    </>
                );
        }
    };

    return (
        <>
            <a onClick={() => setOpen(true)} className="p-1 hover:text-primary cursor-pointer">
                <ReceiptText className="w-4 h-4 text-muted-foreground" />
            </a>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-md p-5">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold">
                            현금결제 매출전표
                        </DialogTitle>
                    </DialogHeader>

                    {/* 전체 작은 spacing 적용 */}
                    <div className="mt-2 space-y-4 text-sm">
                        <SectionTitle>주문 정보</SectionTitle>
                        <ReceiptRow label="결제ID" value={payment.id} />

                        <SectionTitle>구매자 정보</SectionTitle>
                        <ReceiptRow label="구매자" value={payment.user?.username || '-'} />
                        <ReceiptRow label="전화번호" value={payment.user?.phone || '-'} />
                        <ReceiptRow label="등록 관리자" value={payment.admin?.username || '-'} />

                        <SectionTitle>상품 정보</SectionTitle>
                        <ReceiptRow label="상품명" value={payment.productTitle || '-'} />

                        <SectionTitle>결제 정보</SectionTitle>
                        {renderStatusBlock()}

                        <SectionTitle>합계</SectionTitle>
                        <div className="text-right text-lg font-bold text-blue-600 mt-1">
                            {number(
                                payment.paymentStatus === 'REFUNDED'
                                    ? 0
                                    : payment.paymentStatus === 'PARTIAL_REFUNDED'
                                    ? payment.price - payment.cancelAmount
                                    : payment.price
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

/* ---------- COMPACT COMPONENTS ---------- */

function ReceiptRow({
    label,
    value,
    bold,
    highlight,
}: {
    label: string;
    value: any;
    bold?: boolean;
    highlight?: 'yellow' | 'red' | boolean;
}) {
    const highlightColor =
        highlight === 'yellow'
            ? 'text-yellow-600 font-semibold'
            : highlight === 'red'
            ? 'text-red-600 font-semibold'
            : highlight
            ? 'text-blue-600 font-semibold'
            : '';

    return (
        <div className="flex justify-between border-b py-1">
            <span className="text-gray-500 text-[13px]">{label}</span>
            <span className={`text-[13px] ${bold ? 'font-bold' : ''} ${highlightColor}`}>
                {value}
            </span>
        </div>
    );
}

function SectionTitle({ children }: any) {
    return <div className="mt-2 font-semibold text-gray-700 text-[13px]">{children}</div>;
}
