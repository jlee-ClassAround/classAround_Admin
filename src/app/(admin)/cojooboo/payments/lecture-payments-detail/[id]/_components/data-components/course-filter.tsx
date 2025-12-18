'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CourseOption } from '../../../../toss-customers/_components/course-filter';

export function CourseFilter({
    courseOptions,
    value,
    onChange,
}: {
    courseOptions: CourseOption[];
    value: string | null;
    onChange: (v: string | null) => void;
}) {
    return (
        <Select value={value ?? 'ALL'} onValueChange={(v) => onChange(v === 'ALL' ? null : v)}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="강의 선택" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="ALL">전체 강의</SelectItem>
                {courseOptions.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                        {course.title}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
