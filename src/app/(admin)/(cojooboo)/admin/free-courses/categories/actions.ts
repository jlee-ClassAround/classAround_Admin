"use server";

import { db } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "카테고리명을 입력해주세요."),
  description: z.string().optional(),
});

export async function createCategory(_: any, formData: FormData) {
  const data = Object.fromEntries(formData);

  const result = categorySchema.safeParse(data);
  if (!result.success) {
    return {
      error: result.error.flatten().fieldErrors,
    };
  }

  const category = await db.category.findUnique({
    where: {
      name_type: {
        name: result.data.name,
        type: "FREE_COURSE",
      },
    },
    select: {
      id: true,
    },
  });
  if (category) {
    return {
      error: { name: ["이미 존재하는 카테고리명입니다."] },
    };
  }

  await db.category.create({
    data: {
      name: result.data.name,
      description: result.data.description,
      type: "FREE_COURSE",
    },
  });

  revalidatePath("/admin/free-courses/categories");
  revalidateTag("categories");

  return {
    success: true,
    message: "카테고리가 생성되었습니다.",
  };
}

export async function deleteCategory(categoryId: string) {
  const category = await db.category.findUnique({
    where: {
      id: categoryId,
    },
    include: {
      _count: {
        select: {
          freeCourses: true,
        },
      },
    },
  });
  if (category?._count.freeCourses && category?._count.freeCourses > 0) {
    return {
      success: false,
      message: "강의에서 사용 중인 카테고리는 삭제할 수 없습니다.",
    };
  }

  await db.category.delete({
    where: {
      id: categoryId,
    },
  });

  revalidatePath("/admin/free-courses/categories");
  revalidateTag("categories");

  return {
    success: true,
    message: "삭제가 완료되었습니다.",
  };
}

export async function updateCategory(_: any, formData: FormData) {
  const data = Object.fromEntries(formData);

  const result = categorySchema.safeParse(data);
  if (!result.success) {
    return {
      error: result.error.flatten().fieldErrors,
    };
  }

  try {
    await db.category.update({
      where: {
        id: formData.get("categoryId") as string,
      },
      data: {
        name: result.data.name,
        description: result.data.description,
      },
    });
  } catch (e) {
    console.log("CATEGORY_UPDATE_ERROR", e);
  }

  revalidatePath("/admin/free-courses/categories");
  revalidateTag("categories");

  return {
    success: true,
  };
}
