import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { NextResponse } from "next/server";
import { CourseSchema } from "@/validations/schemas";
import { DetailImageType } from "@/store/use-detail-images";
import { TeacherType } from "@/store/use-select-teachers";
import { revalidateTag } from "next/cache";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin)
      return NextResponse.json({ error: "Unauthorized", status: 401 });

    const { courseId } = await params;
    const {
      values,
      images,
      teachers,
    }: {
      values: CourseSchema;
      images: DetailImageType[];
      teachers: TeacherType[];
    } = await req.json();

    const { productBadgeIds, ...data } = values;

    const course = await db.course.update({
      where: { id: courseId },
      data: {
        ...data,
        detailImages: {
          deleteMany: {},
          create: images.map((image, index: number) => ({
            name: image.name,
            imageUrl: image.imageUrl,
            position: index + 1,
          })),
        },
        teachers: {
          set: teachers.map((teacher) => ({
            id: teacher.id,
          })),
        },
        productBadge: {
          set: productBadgeIds
            ? productBadgeIds.map((id) => ({
                id,
              }))
            : [],
        },
      },
    });

    revalidateTag("courses");
    revalidateTag("best-courses");
    revalidateTag("free-courses");
    revalidateTag(`course-${courseId}`);
    revalidateTag(`courses-PAID`);

    return NextResponse.json(course);
  } catch (error) {
    console.log("[COURSES_UPDATE] /api/courses/[courseId]", error);
    return NextResponse.json({ error: "Internal Server Error", status: 500 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin)
      return NextResponse.json({ error: "Unauthorized", status: 401 });

    const { courseId } = await params;
    await db.course.delete({ where: { id: courseId } });

    revalidateTag("courses");
    revalidateTag("best-courses");
    revalidateTag("free-courses");
    revalidateTag(`course-${courseId}`);

    return NextResponse.json({ message: "Course deleted successfully" });
  } catch (e) {
    console.log("[COURSES_DELETE] /api/courses/[courseId]", e);
    return NextResponse.json({ error: "Internal Server Error", status: 500 });
  }
}
