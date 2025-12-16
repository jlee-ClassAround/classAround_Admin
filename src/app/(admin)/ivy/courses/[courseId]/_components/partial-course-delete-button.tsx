'use client';

import { Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { deletePartialCourse } from '../actions/delete-partial-course';

export function PartialCourseDeleteButton({ id }: { id: string }) {
    const router = useRouter();

    const onDelete = async () => {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        try {
            await deletePartialCourse(id);
            toast.success('삭제되었습니다.');
            router.refresh();
        } catch (error) {
            toast.error('삭제 중 오류가 발생했습니다.');
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
        >
            <Trash className="w-4 h-4" />
        </Button>
    );
}
