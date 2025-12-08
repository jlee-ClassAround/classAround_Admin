"use server";

import { db } from "@/lib/db";
import { Category, Ebook, ProductBadge } from "@prisma/client";
import { unstable_cache as nextCache } from "next/cache";

interface Props {
  categoryId?: string;
  currentPage?: number;
  pageSize?: number;
}

export interface EbookWithCategory extends Ebook {
  category: Category | null;
  productBadge: ProductBadge[];
}

interface IGetEbooks {
  ebooks: EbookWithCategory[];
  totalCount: number;
}

export async function getEbooks({
  categoryId,
  currentPage = 1,
  pageSize = 12,
}: Props): Promise<IGetEbooks> {
  try {
    const ebooks = await db.ebook.findMany({
      where: {
        isPublished: true,
        categoryId,
      },
      include: {
        category: true,
        productBadge: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: pageSize,
      skip: (currentPage - 1) * pageSize,
    });
    const totalCount = await db.ebook.count({
      where: {
        isPublished: true,
        categoryId,
      },
    });

    return { ebooks, totalCount };
  } catch {
    return { ebooks: [], totalCount: 0 };
  }
}

export async function getCachedEbooks(props: Props) {
  const cache = nextCache(
    getEbooks,
    [`${props.categoryId ? "ebooks-" + props.categoryId : "ebooks"}`],
    {
      tags: [
        `${props.categoryId ? "ebooks-" + props.categoryId : "ebooks"}`,
        "ebooks",
      ],
      revalidate: 60 * 60 * 24,
    }
  );

  return cache(props);
}
