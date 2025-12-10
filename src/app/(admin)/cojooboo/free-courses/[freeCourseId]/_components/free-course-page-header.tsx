'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FreeCourse } from '@/generated/cojooboo';
import { Eye, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props {
    freeCourse: FreeCourse;
}

export function FreeCoursePageHeader({ freeCourse }: Props) {
    const pathname = usePathname();

    return (
        <div className="flex justify-between mb-6 items-start gap-x-5">
            <div className="flex items-center gap-x-5 flex-1">
                <div className="relative aspect-video max-w-[160px] w-full bg-gray-50 flex-shrink-0 rounded-lg overflow-hidden border">
                    {freeCourse.thumbnail ? (
                        <Image
                            fill
                            src={freeCourse.thumbnail}
                            alt="Free Course Thumbnail"
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="size-8 text-gray-400" />
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-y-5">
                    <h1 className="text-2xl font-semibold">{freeCourse.title}</h1>
                    <div className="flex items-center gap-x-5 text-sm font-medium">
                        <Link
                            href={`/cojooboo/free-courses/${freeCourse.id}`}
                            className={cn(
                                'border-b-2 pb-1 border-transparent transition-colors text-gray-500',
                                pathname === `/cojooboo/free-courses/${freeCourse.id}` &&
                                    'border-primary text-black'
                            )}
                        >
                            기본 설정
                        </Link>
                        <Link
                            href={`/cojooboo/free-courses/${freeCourse.id}/apply`}
                            className={cn(
                                'border-b-2 pb-1 border-transparent transition-colors text-gray-500',
                                pathname.includes(
                                    `/cojooboo/free-courses/${freeCourse.id}/apply`
                                ) && 'border-primary text-black'
                            )}
                        >
                            신청자
                        </Link>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-x-2">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/free-courses/${freeCourse.id}`}>
                        <Eye className="size-4" />
                        <span className="sr-only">미리보기</span>
                    </Link>
                </Button>
            </div>
        </div>
    );
}
