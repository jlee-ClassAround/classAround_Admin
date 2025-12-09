'use server';

import { ivyDb } from '@/lib/ivyDb';

export async function createAttachment({
    lessonId,
    name,
    url,
}: {
    lessonId: string;
    name: string;
    url: string;
}) {
    await ivyDb.attachment.create({
        data: {
            lessonId,
            name,
            url,
        },
    });
}
