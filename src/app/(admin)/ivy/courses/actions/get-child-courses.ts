'use server';

import { ivyDb } from '@/lib/ivyDb';
import type { Course } from '@/generated/ivy';

export type ChildCourseRow = Pick<
    Course,
    | 'id'
    | 'title'
    | 'parentId'
    | 'isPublished'
    | 'isHidden'
    | 'originalPrice'
    | 'discountedPrice'
    | 'createdAt'
>;

export async function getChildCoursesByParentId(parentId: string): Promise<ChildCourseRow[]> {
    if (!parentId) return [];

    return ivyDb.course.findMany({
        where: { parentId },
        select: {
            id: true,
            title: true,
            parentId: true,
            isPublished: true,
            isHidden: true,
            originalPrice: true,
            discountedPrice: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
    });
}
