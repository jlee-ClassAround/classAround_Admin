'use server';

import { ivyDb } from '@/lib/ivyDb';
import { Category, DetailImage, FreeCourse, ProductBadge, Teacher } from '@/generated/ivy';
import { unstable_cache as nextCache } from 'next/cache';

export interface GetFreeCourse extends FreeCourse {
    detailImages: DetailImage[];
    teachers: Teacher[];
    category: Category | null;
    productBadge: ProductBadge[];
}

type GetFreeCourseResponse = GetFreeCourse | null;

export async function getFreeCourse(freeCourseId: string): Promise<GetFreeCourseResponse> {
    const course = await ivyDb.freeCourse.findUnique({
        where: {
            id: freeCourseId,
            isPublished: true,
        },
        include: {
            detailImages: {
                orderBy: {
                    position: 'asc',
                },
            },
            teachers: true,
            category: true,
            productBadge: true,
        },
    });

    return course;
}

export async function getCachedFreeCourse(freeCourseId: string) {
    const cache = nextCache(getFreeCourse, [`free-course-${freeCourseId}`], {
        tags: [`free-course-${freeCourseId}`, 'single-free-course'],
        revalidate: 60 * 60 * 3,
    });

    return cache(freeCourseId);
}
