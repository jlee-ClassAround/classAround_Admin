'use server';

import { ivyDb } from '@/lib/ivyDb';

export async function getLessonAttachments(lessonId: string) {
    try {
        const attachments = await ivyDb.attachment.findMany({
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
