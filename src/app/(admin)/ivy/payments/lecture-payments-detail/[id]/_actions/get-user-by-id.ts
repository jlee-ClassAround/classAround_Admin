'use server';

import { ivyDb } from '@/lib/ivyDb';

export async function getUserById(userId: string) {
    try {
        const user = await ivyDb.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                phone: true,
                createdAt: true,
            },
        });
        return user;
    } catch (error) {
        console.error('[GET_USER_ERROR]', error);
        return null;
    }
}
