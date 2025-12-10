'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';

export async function createAttachment({
    lessonId,
    name,
    url,
}: {
    lessonId: string;
    name: string;
    url: string;
}) {
    await cojoobooDb.attachment.create({
        data: {
            lessonId,
            name,
            url,
        },
    });
}
