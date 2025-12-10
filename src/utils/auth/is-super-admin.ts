'use server';

import { caDb } from '@/lib/caDb';

import { getSession } from '@/lib/session';

export async function getIsSuperAdmin() {
    try {
        const session = await getSession();
        const user = await caDb.user.findUnique({
            where: {
                id: session.id,
            },
            select: {
                roleId: true,
            },
        });

        return user?.roleId === 'superadmin';
    } catch {
        return false;
    }
}
