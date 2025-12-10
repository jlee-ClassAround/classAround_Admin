'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import { Prisma } from '@prisma/client';
import { unstable_cache as nextCache } from 'next/cache';

interface CountResult {
    total: number;
}

export interface ResultOfCourseWithFreeCourse {
    id: string;
    title: string;
    thumbnail: string | null;
    originalPrice: number | null;
    courseType: 'PAID' | 'FREE';
    teachers: {
        id: string;
        name: string;
        profile: string | null;
    }[];
    category: {
        id: string;
        name: string;
        description: string | null;
    } | null;
    productBadge:
        | {
              id: string;
              name: string;
              color: string | null;
              textColor: string | null;
          }[]
        | null;
    createdAt: Date;
}

interface Props {
    currentPage: number;
    pageSize: number;
    categoryId?: string;
    courseType?: 'PAID' | 'FREE';
    title?: string;
}

export async function getAllCoursesWithFreeCourses({
    currentPage = 1,
    pageSize = 12,
    categoryId,
    courseType,
    title,
}: Props) {
    const offset = (currentPage - 1) * pageSize;

    const countQuery = Prisma.sql`
    SELECT COUNT(*) as total FROM (
      SELECT id, 'PAID' as "courseType", "categoryId" FROM "Course" WHERE "isPublished" = true AND "isHidden" = false
      UNION ALL
      SELECT id, 'FREE' as "courseType", "categoryId" FROM "FreeCourse" WHERE "isPublished" = true AND "isHidden" = false
    ) as combined
    ${
        categoryId || courseType
            ? Prisma.sql`WHERE ${Prisma.join(
                  [
                      categoryId ? Prisma.sql`"categoryId" = ${categoryId}` : null,
                      courseType ? Prisma.sql`"courseType" = ${courseType}` : null,
                  ].filter(Boolean),
                  ' AND '
              )}`
            : Prisma.empty
    }
  `;

    const dataQuery = Prisma.sql`
    SELECT 
      c.*,
      COALESCE(json_agg(DISTINCT jsonb_build_object(
        'id', t.id,
        'name', t.name,
        'profile', t.profile
      )) FILTER (WHERE t.id IS NOT NULL), '[]') as teachers,
      json_build_object(
        'id', cat.id,
        'name', cat.name,
        'description', cat.description
      ) as category,
      COALESCE(json_agg(DISTINCT jsonb_build_object(
        'id', pb.id,
        'name', pb.name,
        'color', pb."color",
        'textColor', pb."textColor"
      )) FILTER (WHERE pb.id IS NOT NULL), '[]') as "productBadge"
    FROM (
      SELECT 
        id, 
        title, 
        "thumbnail",
        "originalPrice",
        'PAID' as "courseType",
        "categoryId",
        "createdAt"
      FROM "Course"
      WHERE "isPublished" = true
        AND "isHidden" = false
      
      UNION ALL
      
      SELECT 
        id, 
        title, 
        "thumbnail",
        NULL as "originalPrice",
        'FREE' as "courseType",
        "categoryId",
        "createdAt"
      FROM "FreeCourse"
      WHERE "isPublished" = true
        AND "isHidden" = false
    ) as c
    LEFT JOIN "_CourseToTeacher" ctt ON c.id = ctt."A"
    LEFT JOIN "Teacher" t ON ctt."B" = t.id
    LEFT JOIN "Category" cat ON c."categoryId" = cat.id
    LEFT JOIN "_CourseToProductBadge" cpb ON c.id = cpb."A"
    LEFT JOIN "ProductBadge" pb ON cpb."B" = pb.id
    WHERE c.id IS NOT NULL ${
        categoryId || courseType || title
            ? Prisma.sql`AND ${Prisma.join(
                  [
                      categoryId ? Prisma.sql`c."categoryId" = ${categoryId}` : null,
                      courseType ? Prisma.sql`c."courseType" = ${courseType}` : null,
                      title ? Prisma.sql`c.title ILIKE ${`%${title}%`}` : null,
                  ].filter(Boolean),
                  ' AND '
              )}`
            : Prisma.empty
    }
    GROUP BY 
      c.id, 
      c.title, 
      c.thumbnail,
      c."originalPrice",
      c."courseType",
      c."categoryId",
      c."createdAt",
      cat.id,
      cat.name,
      cat.description
    ORDER BY c."createdAt" DESC
    LIMIT ${pageSize}
    OFFSET ${offset}
  `;

    const [countResult, courses] = await Promise.all([
        cojoobooDb.$queryRaw<CountResult[]>(countQuery),
        cojoobooDb.$queryRaw<ResultOfCourseWithFreeCourse[]>(dataQuery),
    ]);

    return {
        courses,
        totalCount: Number(countResult[0].total),
    };
}

export async function getCachedAllCoursesWithFreeCourses(props: Props) {
    const cacheKey = `all-courses-with-free-courses-${props.currentPage || 1}-${
        props.pageSize || 12
    }-${props.categoryId || 'all'}-${props.courseType || 'all'}-${props.title || 'all'}`;

    const cache = nextCache(getAllCoursesWithFreeCourses, [cacheKey], {
        tags: [cacheKey, 'courses'],
        revalidate: 60 * 60 * 24,
    });

    return cache(props);
}
