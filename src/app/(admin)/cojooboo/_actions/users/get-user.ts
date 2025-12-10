'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';

export const getUser = async (userId: string | undefined) => {
    try {
        const user = await cojoobooDb.user.findUnique({
            where: {
                id: userId,
            },
        });

        return user;
    } catch {
        return null;
    }
};
