import { getCategories } from "@/actions/categories/get-categories";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { CourseForm } from "./_components/course-form";
import { OptionModal } from "./_components/option-modal";

export default async function CourseIdPage(props: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await props.params;
  const course = await db.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      chapters: {
        include: {
          lessons: true,
        },
      },
      detailImages: true,
      category: true,
      teachers: true,
      options: {
        orderBy: {
          createdAt: "asc",
        },
      },
      productBadge: true,
    },
  });
  if (!course) return redirect("/admin/courses/all");

  const categories = await getCategories({ type: "COURSE" });

  const teachers = await db.teacher.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const productBadges = await db.productBadge.findMany();

  return (
    <>
      <CourseForm
        course={course}
        categories={categories}
        teachers={teachers}
        productBadges={productBadges}
      />
      <OptionModal courseId={courseId} />
    </>
  );
}
