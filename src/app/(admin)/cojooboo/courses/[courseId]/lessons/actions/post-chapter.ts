'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';

import { ChapterSchema } from '@/lib/cojooboo/schemas';
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

        const lastChapter = await cojoobooDb.chapter.findFirst({
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

        const newChapter = await cojoobooDb.chapter.create({
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
