'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import { getIsAdmin } from '@/lib/is-admin';
import { revalidateTag } from 'next/cache';
import { FaqSchema } from '@/lib/cojooboo/schemas';

// ----------------------------
// CREATE FAQ
// ----------------------------
export async function createFaqAction(values: FaqSchema) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return { success: false, error: 'Unauthorized' };

        await cojoobooDb.faq.create({
            data: {
                title: values.title,
                content: values.content,
                categoryId: values.categoryId || null,
                isPublished: values.isPublished ?? true,
            },
        });

        revalidateTag('main-faqs');
        revalidateTag('faqs');

        return { success: true };
    } catch (e) {
        console.error('[FAQ_CREATE_ACTION]', e);
        return { success: false, error: 'Failed to create FAQ' };
    }
}

// ----------------------------
// UPDATE FAQ
// ----------------------------
export async function updateFaqAction(id: number, values: FaqSchema) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return { success: false, error: 'Unauthorized' };

        await cojoobooDb.faq.update({
            where: { id },
            data: {
                title: values.title,
                content: values.content,
                categoryId: values.categoryId || null,
                isPublished: values.isPublished ?? true,
            },
        });

        revalidateTag('main-faqs');
        revalidateTag('faqs');

        return { success: true };
    } catch (e) {
        console.error('[FAQ_UPDATE_ACTION]', e);
        return { success: false, error: 'Failed to update FAQ' };
    }
}

// ----------------------------
// DELETE SINGLE FAQ
// ----------------------------
export async function deleteFaqAction(id: number) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return { success: false, error: 'Unauthorized' };

        await cojoobooDb.faq.delete({
            where: { id },
        });

        revalidateTag('main-faqs');
        revalidateTag('faqs');

        return { success: true };
    } catch (e) {
        console.error('[FAQ_DELETE_ACTION]', e);
        return { success: false, error: 'Failed to delete FAQ' };
    }
}

// ----------------------------
// DELETE MULTIPLE FAQS
// ----------------------------
export async function deleteFaqsAction(ids: number[]) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return { success: false, error: 'Unauthorized' };

        await cojoobooDb.faq.deleteMany({
            where: { id: { in: ids } },
        });

        revalidateTag('main-faqs');
        revalidateTag('faqs');

        return { success: true };
    } catch (e) {
        console.error('[FAQS_DELETE_ACTION]', e);
        return { success: false, error: 'Failed to delete FAQs' };
    }
}
