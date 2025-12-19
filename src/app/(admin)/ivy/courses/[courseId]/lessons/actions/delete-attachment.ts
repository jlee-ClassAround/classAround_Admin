'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';

export async function deleteAttachment({ attachmentId }: { attachmentId: string }) {
    await cojoobooDb.attachment.delete({
        where: { id: attachmentId },
    });
}
