import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { UserPageHeader } from "./_components/user-page-header";
import { AdminUserPageHeaderSkeleton } from "@/components/skeletons/admin-user-page-header-skeleton";

export default async function AdminUserIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) return notFound();

  return (
    <>
      <Suspense fallback={<AdminUserPageHeaderSkeleton />}>
        <UserPageHeader user={user} />
      </Suspense>
      {children}
    </>
  );
}
