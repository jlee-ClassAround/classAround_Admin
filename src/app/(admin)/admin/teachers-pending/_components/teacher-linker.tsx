// ./_components/teacher-linker.tsx
'use client';

import { useState } from 'react';
import { linkTeacherAction } from '../actions';
import { toast } from 'sonner'; // 혹은 사용하시는 토스트 라이브러리

interface TeacherOption {
    id: string;
    name: string;
}

interface TeacherLinkerProps {
    authTeacherId: string;
    initialTId: string | null;
    options: TeacherOption[];
}

export function TeacherLinker({ authTeacherId, initialTId, options }: TeacherLinkerProps) {
    const [selectedId, setSelectedId] = useState(initialTId || '');
    const [isPending, setIsPending] = useState(false);

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newId = e.target.value;
        setSelectedId(newId);

        if (!newId) return;

        setIsPending(true);
        const result = await linkTeacherAction(authTeacherId, newId);
        setIsPending(false);

        if (result.success) {
            toast.success('강사 연결이 업데이트되었습니다.');
        } else {
            toast.error(result.error);
        }
    };

    return (
        <select
            value={selectedId}
            onChange={handleChange}
            disabled={isPending}
            className="w-full max-w-[150px] rounded border border-gray-300 p-1 text-xs focus:ring-2 focus:ring-primary"
        >
            <option value="">강사 선택...</option>
            {options.map((opt) => (
                <option key={opt.id} value={opt.id}>
                    {opt.name} ({opt.id.slice(-4)})
                </option>
            ))}
        </select>
    );
}
