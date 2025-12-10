'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import { getIsAdmin } from '@/lib/is-admin';
import { revalidateTag } from 'next/cache';
import { NoticeSchema } from '@/lib/cojooboo/schemas';

// ---------------------------------------
// CREATE NOTICE
// ---------------------------------------
export async function createNoticeAction(values: NoticeSchema) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return { success: false, error: 'Unauthorized' };

        await cojoobooDb.notice.create({
            data: {
                title: values.title,
                content: values.content,
                isPublished: values.isPublished ?? true,
            },
        });

        revalidateTag('notices');

        return { success: true };
    } catch (error) {
        console.error('[NOTICE_CREATE_ACTION]', error);
        return { success: false, error: 'Failed to create notice' };
    }
}

// ---------------------------------------
// UPDATE NOTICE
// ---------------------------------------
export async function updateNoticeAction(id: number, values: NoticeSchema) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return { success: false, error: 'Unauthorized' };

        await cojoobooDb.notice.update({
            where: { id },
            data: {
                title: values.title,
                content: values.content,
                isPublished: values.isPublished ?? true,
            },
        });

        revalidateTag('notices');
        revalidateTag(`notice-${id}`);

        return { success: true };
    } catch (error) {
        console.error('[NOTICE_UPDATE_ACTION]', error);
        return { success: false, error: 'Failed to update notice' };
    }
}

// ---------------------------------------
// DELETE single NOTICE
// ---------------------------------------
export async function deleteNoticeAction(id: number) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return { success: false, error: 'Unauthorized' };

        await cojoobooDb.notice.delete({
            where: { id },
        });

        revalidateTag('notices');
        revalidateTag(`notice-${id}`);

        return { success: true };
    } catch (error) {
        console.error('[NOTICE_DELETE_ACTION]', error);
        return { success: false, error: 'Failed to delete notice' };
    }
}

// ---------------------------------------
// DELETE multiple NOTICES
// ---------------------------------------
export async function deleteNoticesAction(ids: number[]) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return { success: false, error: 'Unauthorized' };

        await cojoobooDb.notice.deleteMany({
            where: { id: { in: ids } },
        });

        revalidateTag('notices');
        ids.forEach((id) => revalidateTag(`notice-${id}`));

        return { success: true };
    } catch (error) {
        console.error('[NOTICES_DELETE_ACTION]', error);
        return { success: false, error: 'Failed to delete notices' };
    }
}
