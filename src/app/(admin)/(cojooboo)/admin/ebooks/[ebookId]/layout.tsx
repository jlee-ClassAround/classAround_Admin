import AdminCourseIdHeaderSkeleton from "@/components/skeletons/admin-course-id-header-skeleton";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { EbookIdHeader } from "./_components/ebook-id-header";

export default async function AdminEbookIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ ebookId: string }>;
}) {
  const { ebookId } = await params;
  const ebook = await db.ebook.findUnique({
    where: {
      id: ebookId,
    },
  });
  if (!ebook) return redirect("/admin/ebooks/all");

  return (
    <>
      <Suspense fallback={<AdminCourseIdHeaderSkeleton />}>
        <EbookIdHeader ebook={ebook} />
      </Suspense>
      {children}
    </>
  );
}
