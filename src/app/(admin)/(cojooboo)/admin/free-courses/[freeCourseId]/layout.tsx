import AdminCourseIdHeaderSkeleton from "@/components/skeletons/admin-course-id-header-skeleton";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FreeCoursePageHeader } from "./_components/free-course-page-header";

export default async function AdminFreeCourseIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ freeCourseId: string }>;
}) {
  const { freeCourseId } = await params;
  const freeCourse = await db.freeCourse.findUnique({
    where: {
      id: freeCourseId,
    },
  });
  if (!freeCourse) return redirect("/admin/free-courses/all");

  return (
    <>
      <Suspense fallback={<AdminCourseIdHeaderSkeleton />}>
        <FreeCoursePageHeader freeCourse={freeCourse} />
      </Suspense>
      {children}
    </>
  );
}
