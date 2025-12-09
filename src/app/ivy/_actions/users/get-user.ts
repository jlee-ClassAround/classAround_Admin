'use server';

import { ivyDb } from '@/lib/ivyDb';

export const getUser = async (userId: string | undefined) => {
    try {
        const user = await ivyDb.user.findUnique({
            where: {
                id: userId,
            },
        });

        return user;
    } catch {
        return null;
    }
};
