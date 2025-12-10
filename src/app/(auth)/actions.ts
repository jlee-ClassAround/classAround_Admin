'use server';

import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

import { caDb } from '@/lib/caDb';
import { getSession } from '@/lib/session';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

interface LoginPayload {
    userId: string;
    password: string;
}

type FirstRegisterLookupSuccess = {
    success: true;
    user: any;
};

type FirstRegisterLookupFail = {
    success: false;
    error: string;
};

export type FirstRegisterLookupResult = FirstRegisterLookupSuccess | FirstRegisterLookupFail;

export async function loginAction({ userId, password }: LoginPayload) {
    const user = await caDb.user.findUnique({
        where: { userId },
    });

    if (!user) {
        return { success: false, error: '존재하지 않는 사용자입니다.' };
    }

    if (!user.password) {
        return { success: false, error: '비밀번호가 설정되지 않은 계정입니다.' };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        return { success: false, error: '비밀번호가 일치하지 않습니다.' };
    }

    const session = await getSession();
    session.id = user.id;
    session.userId = user.userId ?? '';
    session.roleId = user.roleId;
    session.username = user.username ?? '';
    await session.save();

    return { success: true };
}

export async function logoutAction() {
    const session = await getSession();
    session.destroy();
    return { success: true };
}

export async function firstRegisterLookupAction({
    phone,
}: {
    phone: string;
}): Promise<FirstRegisterLookupResult> {
    const user = await caDb.user.findFirst({
        where: { phone },
    });

    if (!user) {
        return { success: false, error: '해당 핸드폰 번호로 가입된 사용자가 없습니다.' };
    }

    return { success: true, user };
}

export async function firstRegisterUpdateAction({ id, email }: { id: string; email: string }) {
    await caDb.user.update({
        where: { id },
        data: {
            email,
            updatedAt: new Date(),
        },
    });

    return { success: true };
}
