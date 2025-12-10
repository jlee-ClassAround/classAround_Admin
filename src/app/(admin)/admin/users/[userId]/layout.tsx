import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { AdminUserPageHeaderSkeleton } from '@/components/skeletons/admin-user-page-header-skeleton';
import { caDb } from '@/lib/caDb';

export default async function AdminUserIdLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ userId: string }>;
}) {
    const { userId } = await params;
    const user = await caDb.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (!user) return notFound();

    return (
        <>
            <Suspense fallback={<AdminUserPageHeaderSkeleton />}></Suspense>
            {children}
        </>
    );
}
