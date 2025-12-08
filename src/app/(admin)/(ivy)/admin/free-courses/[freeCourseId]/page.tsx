import { getCategories } from "@/actions/categories/get-categories";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { FreeCourseForm } from "./_components/free-course-form";

export default async function FreeCourseIdPage(props: {
  params: Promise<{ freeCourseId: string }>;
}) {
  const { freeCourseId } = await props.params;
  const freeCourse = await db.freeCourse.findUnique({
    where: {
      id: freeCourseId,
    },
    include: {
      detailImages: true,
      category: true,
      teachers: true,
      productBadge: true,
    },
  });
  if (!freeCourse) return redirect("/admin/free-courses/all");

  const categories = await getCategories({ type: "FREE_COURSE" });

  const teachers = await db.teacher.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const productBadges = await db.productBadge.findMany();

  // const { data } = await getKajabiTags({ size: 100 });
  // const tags = data?.map((item) => ({
  //   value: item.id,
  //   label: item.attributes.name,
  // }));

  return (
    <>
      <FreeCourseForm
        freeCourse={freeCourse}
        categories={categories}
        teachers={teachers}
        productBadges={productBadges}
        // tags={tags || []}
      />
    </>
  );
}
