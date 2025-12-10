'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import { getIsAdmin } from '@/lib/is-admin';

export async function createEventAction(values: {
    title: string;
    content: string;
    thumbnail?: string | null;
}) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return { success: false, error: 'Unauthorized' };

        const event = await cojoobooDb.event.create({
            data: {
                title: values.title,
                content: values.content,
                thumbnail: values.thumbnail ?? null,
            },
        });

        return { success: true, event };
    } catch (error) {
        console.error('[CREATE_EVENT_ACTION]', error);
        return { success: false, error: 'Internal error' };
    }
}

export async function updateEventAction(
    id: number,
    values: {
        title: string;
        content: string;
        thumbnail?: string | null;
    }
) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return { success: false, error: 'Unauthorized' };

        await cojoobooDb.event.update({
            where: { id },
            data: {
                title: values.title,
                content: values.content,
                thumbnail: values.thumbnail ?? null,
            },
        });

        return { success: true };
    } catch (error) {
        console.error('[UPDATE_EVENT_ACTION]', error);
        return { success: false, error: 'Internal error' };
    }
}

export async function deleteEventByIdAction(id: number) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return { success: false, error: 'Unauthorized' };

        await cojoobooDb.event.delete({ where: { id } });

        return { success: true };
    } catch (error) {
        console.error('[DELETE_EVENT_ACTION]', error);
        return { success: false, error: 'Internal error' };
    }
}

export async function deleteEventsAction(ids: number[]) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return { success: false, error: 'Unauthorized' };

        await cojoobooDb.event.deleteMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });

        return { success: true };
    } catch (error) {
        console.error('[DELETE_EVENTS_ACTION]', error);
        return { success: false, error: 'Internal error' };
    }
}
