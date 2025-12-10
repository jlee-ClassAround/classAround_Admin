'use server';

import { caDb } from '@/lib/caDb';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function getUserById(id: string) {
    const user = await caDb.user.findUnique({
        where: { id },
    });

    if (!user) return null;

    return user;
}

export async function updateUserRegisterAction(formData: FormData) {
    const id = formData.get('id') as string;
    const username = formData.get('username') as string;
    const phone = formData.get('phone') as string;
    const userId = formData.get('userId') as string;
    const password = formData.get('password') as string;

    const hashedPassword = await bcrypt.hash(password, 10);

    await caDb.user.update({
        where: { id },
        data: {
            username,
            phone,
            userId,
            password: hashedPassword,
            updatedAt: new Date(),
        },
    });

    redirect('/login');
}
