'use server';

import { ivyDb } from '@/lib/ivyDb';
import { Category, Course, Teacher, ProductBadge } from '@/generated/ivy';
import { unstable_cache as nextCache } from 'next/cache';

export interface IGetBestCourses extends Course {
    teachers: Teacher[];
    category: Category | null;
    productBadge: ProductBadge[];
}

export async function getBestCourses(): Promise<IGetBestCourses[]> {
    try {
        const courses = await ivyDb.course.findMany({
            where: {
                isPublished: true,
                isHidden: false,
            },
            include: {
                teachers: true,
                category: true,
                productBadge: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 20,
        });

        return courses;
    } catch {
        return [];
    }
}

export async function getCacheivyDbestCourses() {
    const cache = nextCache(getBestCourses, ['best-courses'], {
        tags: ['best-courses'],
        revalidate: 60 * 60 * 24,
    });

    return cache();
}
