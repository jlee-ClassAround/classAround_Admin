'use server';

import { ivyDb } from '@/lib/ivyDb';

import { ChapterSchema } from '@/lib/ivy/schemas';
import { getIsAdmin } from '@/lib/is-admin';

export async function postChapter({
    courseId,
    values,
}: {
    courseId: string;
    values: ChapterSchema;
}) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return null;

        const lastChapter = await ivyDb.chapter.findFirst({
            where: {
                courseId,
            },
            orderBy: {
                position: 'desc',
            },
            select: {
                position: true,
            },
        });
        const newPosition = lastChapter ? lastChapter.position + 1 : 1;

        const newChapter = await ivyDb.chapter.create({
            data: {
                ...values,
                courseId,
                position: newPosition,
            },
        });

        return newChapter;
    } catch (e) {
        console.log('[POST_CHAPTER_ERROR]', e);
        return null;
    }
}
