"use server";

import { db } from "@/lib/db";
import { Category, Faq } from "@prisma/client";
import { unstable_cache as nextCache } from "next/cache";

interface Props {
  categoryId?: string;
  currentPage?: number;
  pageSize?: number;
}

export interface FaqWithCategory extends Faq {
  category: Category | null;
}

interface IGetFaqs {
  faqs: FaqWithCategory[];
  totalCount: number;
}

export async function getFaqs({
  categoryId,
  currentPage = 1,
  pageSize = 10,
}: Props): Promise<IGetFaqs> {
  try {
    const faqs = await db.faq.findMany({
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
    const totalCount = await db.faq.count({
      where: {
        isPublished: true,
        categoryId,
      },
    });

    return { faqs, totalCount };
  } catch {
    return { faqs: [], totalCount: 0 };
  }
}

export async function getCachedFaqs(props: Props) {
  const cache = nextCache(
    getFaqs,
    [`${props.categoryId ? "faqs-" + props.categoryId : "faqs"}`],
    {
      tags: [
        `${props.categoryId ? "faqs-" + props.categoryId : "faqs"}`,
        "faqs",
      ],
      revalidate: 60 * 60 * 24,
    }
  );

  return cache(props);
}
