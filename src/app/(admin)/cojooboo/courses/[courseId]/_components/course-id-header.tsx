'use client';

import { Button } from '@/components/ui/button';
import { Course } from '@/generated/cojooboo';
import { cn } from '@/lib/utils';

import { Eye, ImageIcon, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { deleteCourseAction } from '../../actions/courses';
import { toast } from 'sonner';

interface Props {
    course: Course;
}

export function CourseIdHeader({ course }: Props) {
    const pathname = usePathname();
    const router = useRouter();

    const [isLoading, setIsLoading] = React.useState(false);

    const handleDelete = async () => {
        if (!confirm('정말 삭제하시겠습니까? 삭제된 강의는 되돌릴 수 없습니다.')) return;

        try {
            setIsLoading(true);
            const result = await deleteCourseAction(course.id);

            if (!result.success) {
                toast.error(result.error || '삭제 중 오류가 발생했습니다.');
                return;
            }

            router.refresh();
            toast.success('강의가 삭제되었습니다.');
        } catch {
            toast.error('삭제 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-between mb-6 items-start gap-x-5">
            <div className="flex items-center gap-x-5 flex-1">
                <div className="relative aspect-video max-w-[160px] w-full bg-gray-50 flex-shrink-0 rounded-lg overflow-hidden border">
                    {course.thumbnail ? (
                        <Image
                            fill
                            src={course.thumbnail}
                            alt="Course Thumbnail"
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="size-8 text-gray-400" />
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-y-5">
                    <h1 className="text-2xl font-semibold">{course.title}</h1>
                    <div className="flex items-center gap-x-5 text-sm font-medium">
                        <Link
                            href={`/cojooboo/courses/${course.id}`}
                            className={cn(
                                'border-b-2 pb-1 border-transparent transition-colors text-gray-500',
                                pathname === `/cojooboo/courses/${course.id}` &&
                                    'border-primary text-black'
                            )}
                        >
                            기본 설정
                        </Link>
                        <Link
                            href={`/cojooboo/courses/${course.id}/lessons`}
                            className={cn(
                                'border-b-2 pb-1 border-transparent transition-colors text-gray-500',
                                pathname.includes(`/cojooboo/courses/${course.id}/lessons`) &&
                                    'border-primary text-black'
                            )}
                        >
                            커리큘럼
                        </Link>
                        <Link
                            href={`/cojooboo/courses/${course.id}/students`}
                            className={cn(
                                'border-b-2 pb-1 border-transparent transition-colors text-gray-500',
                                pathname.includes(`/cojooboo/courses/${course.id}/students`) &&
                                    'border-primary text-black'
                            )}
                        >
                            수강생
                        </Link>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-x-2">
                <Button variant="ghost" size="icon" asChild>
                    <Link
                        href={`${process.env.NEXT_PUBLIC_COJOOBOO_APP_URL}/courses/${course.id}`}
                        target="_blank"
                    >
                        <Eye className="size-4" />
                        <span className="sr-only">미리보기</span>
                    </Link>
                </Button>
                <Button variant="ghost" size="icon" type="button" onClick={handleDelete}>
                    <Trash2 className="size-4" />
                    <span className="sr-only">강의 삭제</span>
                </Button>
            </div>
        </div>
    );
}
