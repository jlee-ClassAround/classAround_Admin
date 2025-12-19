'use server';

import { ivyDb } from '@/lib/ivyDb';

export type ParentCourseOption = {
    id: string;
    title: string;
    parentId: string | null;
};

export async function getCourses(): Promise<ParentCourseOption[]> {
    const rows = await ivyDb.course.findMany({
        where: {
            parentId: null,
        },
        select: {
            id: true,
            title: true,
            parentId: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 2000,
    });

    return rows.map((r) => ({
        id: r.id,
        title: r.title ?? '',
        parentId: r.parentId ?? null,
    }));
}
