import AdminCourseIdHeaderSkeleton from '@/components/skeletons/admin-course-id-header-skeleton';
import { cojoobooDb } from '@/lib/cojoobooDb';
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
    const ebook = await cojoobooDb.ebook.findUnique({
        where: {
            id: ebookId,
        },
    });
    if (!ebook) return redirect('/cojooboo/ebooks/all');

    return (
        <>
            <Suspense fallback={<AdminCourseIdHeaderSkeleton />}>
                <EbookIdHeader ebook={ebook} />
            </Suspense>
            {children}
        </>
    );
}
