import AdminCourseIdHeaderSkeleton from '@/components/skeletons/admin-course-id-header-skeleton';
import { ivyDb } from '@/lib/ivyDb';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { EbookIdHeader } from './_components/ebook-id-header';

export default async function AdminEbookIdLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ ebookId: string }>;
}) {
    const { ebookId } = await params;
    const ebook = await ivyDb.ebook.findUnique({
        where: {
            id: ebookId,
        },
    });
    if (!ebook) return redirect('/ivy/ebooks/all');

    return (
        <>
            <Suspense fallback={<AdminCourseIdHeaderSkeleton />}>
                <EbookIdHeader ebook={ebook} />
            </Suspense>
            {children}
        </>
    );
}
