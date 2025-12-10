'use server';

import { ivyDb } from '@/lib/ivyDb';

export async function deleteAttachment({ attachmentId }: { attachmentId: string }) {
    await ivyDb.attachment.delete({
        where: { id: attachmentId },
    });
}
