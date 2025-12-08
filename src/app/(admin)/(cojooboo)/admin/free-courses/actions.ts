"use server";

import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { FreeCourseSchema } from "@/validations/schemas";
import { DetailImageType } from "@/store/use-detail-images";
import { TeacherType } from "@/store/use-select-teachers";
import { revalidateTag } from "next/cache";
import { v4 as uuidv4 } from "uuid";

export const createFreeCourse = async (data: { title: string }) => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const course = await db.freeCourse.create({
    data,
    select: {
      id: true,
    },
  });
  revalidateTag("free-courses");

  return course;
};

export const updateFreeCourse = async ({
  freeCourseId,
  values,
  images,
  teachers,
}: {
  freeCourseId: string;
  values: FreeCourseSchema;
  images: DetailImageType[];
  teachers: TeacherType[];
}) => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const { productBadgeIds, ...data } = values;

  await db.freeCourse.update({
    where: { id: freeCourseId },
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
        set: productBadgeIds?.map((id) => ({
          id,
        })),
      },
    },
  });

  revalidateTag("free-courses");
  revalidateTag("courses");
  revalidateTag(`free-course-${freeCourseId}`);
  revalidateTag(`courses-FREE`);
};

export const deleteFreeCourse = async (freeCourseId: string) => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  await db.freeCourse.delete({
    where: { id: freeCourseId },
  });

  revalidateTag("free-courses");
  revalidateTag(`free-course-${freeCourseId}`);
  revalidateTag(`courses-FREE`);
};

export const deleteFreeCourses = async ({ ids }: { ids: string[] }) => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  await db.freeCourse.deleteMany({
    where: { id: { in: ids } },
  });

  revalidateTag("free-courses");
  ids.forEach((id) => {
    revalidateTag(`free-course-${id}`);
  });
  revalidateTag(`courses-FREE`);
};

export const duplicateFreeCourse = async (freeCourseId: string) => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const freeCourse = await db.freeCourse.findUnique({
    where: { id: freeCourseId },
    include: {
      detailImages: true,
      teachers: true,
    },
  });

  if (!freeCourse) {
    throw new Error("강의를 찾을 수 없습니다.");
  }

  await db.freeCourse.create({
    data: {
      ...freeCourse,
      id: uuidv4(),
      title: `${freeCourse.title} - 복제됨`,
      isPublished: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      detailImages: {
        create: freeCourse.detailImages.map((image) => ({
          name: image.name,
          imageUrl: image.imageUrl,
          position: image.position,
        })),
      },
      teachers: {
        connect: freeCourse.teachers.map((teacher) => ({
          id: teacher.id,
        })),
      },
    },
  });

  revalidateTag("free-courses");
  revalidateTag(`courses-FREE`);
};
