'use server';

import { getIsAdmin } from '@/lib/is-admin';
import { cojoobooDb } from '@/lib/cojoobooDb';

export async function getUsersAppliedFreeCourse(freeCourseId?: string) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return [];

        const applyCourses = await cojoobooDb.applyCourse.findMany({
            where: {
                freeCourseId,
            },
            include: {
                user: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const users = applyCourses.map((apply) => ({
            ...apply.user,
            appliedAt: apply.createdAt,
            applyId: apply.id,
        }));

        return users;
    } catch {
        return [];
    }
}
