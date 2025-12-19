'use client';

import { Input } from '@/components/ui/input';

export function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="검색어를 입력해주세요"
            className="w-[400px]"
        />
    );
}
