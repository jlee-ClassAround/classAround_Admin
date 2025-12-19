'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const TYPE_OPTIONS = [
    { label: '전체 결제수단', value: 'ALL' },
    { label: '카드결제', value: 'CARD' },
    { label: '현금결제', value: 'CASH' },
];

export function TypeFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="결제 수단 선택" />
            </SelectTrigger>
            <SelectContent>
                {TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
