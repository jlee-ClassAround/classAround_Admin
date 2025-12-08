import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { CourseIdHeader } from "./_components/course-id-header";
import { Suspense } from "react";
import AdminCourseIdHeaderSkeleton from "@/components/skeletons/admin-course-id-header-skeleton";

export default async function AdminCourseIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await db.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      chapters: true,
    },
  });
  if (!course) return redirect("/admin/courses/all");

  return (
    <>
      <Suspense fallback={<AdminCourseIdHeaderSkeleton />}>
        <CourseIdHeader course={course} />
      </Suspense>
      {children}
    </>
  );
}
