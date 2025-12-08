"use server";

import { db } from "@/lib/db";
import { Category, Notice } from "@prisma/client";
import { unstable_cache as nextCache } from "next/cache";

interface Props {
  categoryId?: string;
  currentPage?: number;
  pageSize?: number;
}

export interface NoticeWithCategory extends Notice {
  category: Category | null;
}

interface IGetNotices {
  notices: NoticeWithCategory[];
  totalCount: number;
}

export async function getNotices({
  categoryId,
  currentPage = 1,
  pageSize = 10,
}: Props): Promise<IGetNotices> {
  try {
    const notices = await db.notice.findMany({
      where: {
        isPublished: true,
        categoryId,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: pageSize,
      skip: (currentPage - 1) * pageSize,
    });
    const totalCount = await db.notice.count({
      where: {
        isPublished: true,
        categoryId,
      },
    });

    return { notices, totalCount };
  } catch {
    return { notices: [], totalCount: 0 };
  }
}

export async function getCachedNotices(props: Props) {
  const cache = nextCache(
    getNotices,
    [`${props.categoryId ? "notices-" + props.categoryId : "notices"}`],
    {
      tags: [
        `${props.categoryId ? "notices-" + props.categoryId : "notices"}`,
        "notices",
      ],
      revalidate: 60 * 60 * 24,
    }
  );

  return cache(props);
}
