import { Card } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { ChapterAction } from "./_components/chapter-action";
import { db } from "@/lib/db";

export default async function AdminLessonsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await db.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      chapters: {
        orderBy: {
          position: "asc",
        },
        include: {
          lessons: {
            orderBy: {
              position: "asc",
            },
          },
        },
      },
    },
  });
  if (!course) return redirect(`/admin/courses/all`);

  return (
    <Card className="p-8">
      <ChapterAction courseId={course.id} chapters={course.chapters} />
    </Card>
  );
}
