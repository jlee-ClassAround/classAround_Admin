import AdminCourseIdHeaderSkeleton from '@/components/skeletons/admin-course-id-header-skeleton';
import { cojoobooDb } from '@/lib/cojoobooDb';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { FreeCoursePageHeader } from './_components/free-course-page-header';

export default async function AdminFreeCourseIdLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ freeCourseId: string }>;
}) {
    const { freeCourseId } = await params;
    const freeCourse = await cojoobooDb.freeCourse.findUnique({
        where: {
            id: freeCourseId,
        },
    });
    if (!freeCourse) return redirect('/cojooboo/free-courses/all');

    return (
        <>
            <Suspense fallback={<AdminCourseIdHeaderSkeleton />}>
                <FreeCoursePageHeader freeCourse={freeCourse} />
            </Suspense>
            {children}
        </>
    );
}
