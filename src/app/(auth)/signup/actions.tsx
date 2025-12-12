'use server';

import { caDb } from '@/lib/caDb';
import bcrypt from 'bcryptjs';

interface SignupActionInput {
    username: string;
    phone: string;
    email: string;
    userId: string;
    password: string;
}

export async function signupAction(input: SignupActionInput) {
    const { username, phone, email, userId, password } = input;

    const exists = await caDb.user.findUnique({
        where: { userId },
    });

    if (exists) {
        return { success: false, error: '이미 존재하는 아이디입니다.' };
    }

    const hashed = await bcrypt.hash(password, 10);

    await caDb.user.create({
        data: {
            username,
            phone,
            email,
            userId,
            password: hashed,
            roleId: '-',
        },
    });

    return { success: true };
}
