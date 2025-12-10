'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';

export async function getLessonAttachments(lessonId: string) {
    try {
        const attachments = await cojoobooDb.attachment.findMany({
            where: {
                lessonId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return attachments;
    } catch {
        return [];
    }
}
