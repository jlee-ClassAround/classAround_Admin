import { db } from "@/lib/db";
import { LessonForm } from "./_components/lesson-form";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default async function AdminLessonIdPage({ params }: Props) {
  const { courseId, lessonId } = await params;
  const lesson = await db.lesson.findUnique({
    where: {
      id: lessonId,
    },
  });
  if (!lesson) return redirect(`/admin/courses/${courseId}/lessons`);

  return (
    <div>
      <LessonForm lesson={lesson} courseId={courseId} />
    </div>
  );
}
