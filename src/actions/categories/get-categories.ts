"use server";

import { db } from "@/lib/db";
import { Category, CategoryType } from "@prisma/client";
import { unstable_cache as nextCache } from "next/cache";

interface Props {
  type: CategoryType;
}

export interface IGetCategories extends Category {
  _count: {
    [key: string]: number;
  };
}

export async function getCategories({
  type,
}: Props): Promise<IGetCategories[]> {
  try {
    const categories = await db.category.findMany({
      where: {
        type,
      },
      orderBy: {
        name: "asc",
      },
      include: {
        _count: true,
      },
    });
    return categories;
  } catch {
    return [];
  }
}

export async function getCachedCategories(props: Props) {
  const cache = nextCache(getCategories, [`categories-${props.type}`], {
    tags: [`categories-${props.type}`, "categories"],
    revalidate: 60 * 60 * 24,
  });
  return cache(props);
}
