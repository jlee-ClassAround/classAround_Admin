import { ivyDb } from '@/lib/ivyDb';
import { redirect } from 'next/navigation';
import { CourseIdHeader } from './_components/course-id-header';
import { Suspense } from 'react';
import AdminCourseIdHeaderSkeleton from '@/components/skeletons/admin-course-id-header-skeleton';

export default async function AdminCourseIdLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ courseId: string }>;
}) {
    const { courseId } = await params;
    const course = await ivyDb.course.findUnique({
        where: {
            id: courseId,
        },
        include: {
            chapters: true,
        },
    });
    if (!course) return redirect('/ivy/courses/all');

    return (
        <>
            <Suspense fallback={<AdminCourseIdHeaderSkeleton />}>
                <CourseIdHeader course={course} />
            </Suspense>
            {children}
        </>
    );
}
