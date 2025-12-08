"use server";

import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { OptionSchema } from "@/validations/schemas";

export async function addOption(courseId: string) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  await db.courseOption.create({
    data: {
      courseId,
      name: "옵션명",
      originalPrice: 0,
    },
  });
}

export async function deleteOption(optionId: string) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  await db.courseOption.delete({ where: { id: optionId } });
}

export async function getOptions(courseId: string) {
  try {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const options = await db.courseOption.findMany({
      where: { courseId },
      orderBy: { createdAt: "asc" },
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    return options;
  } catch {
    return [];
  }
}

export async function getOption(optionId: string | null) {
  try {
    if (!optionId) return null;
    const isAdmin = await getIsAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const option = await db.courseOption.findUnique({
      where: { id: optionId },
    });
    return option;
  } catch {
    return null;
  }
}

export async function updateOption({
  optionId,
  values,
}: {
  optionId: string;
  values: {
    name: string;
    originalPrice: number;
    discountedPrice: number | null;
  };
}) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  await db.courseOption.update({
    where: { id: optionId },
    data: {
      ...values,
    },
  });
}
