'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const STATUS_OPTIONS = [
    { label: '전체 상태', value: 'ALL' },
    { label: '결제완료', value: 'COMPLETED' },
    { label: '취소됨', value: 'CANCELLED' },
    { label: '환불됨', value: 'REFUNDED' },
    { label: '결제대기', value: 'WAITING_FOR_DEPOSIT' },
    { label: '분할결제', value: 'PARTIAL' },
];

export function StatusFilter({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="결제 상태 선택" />
            </SelectTrigger>
            <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
