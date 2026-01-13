'use server';

import bcrypt from 'bcryptjs';

import { caDb } from '@/lib/caDb';
import { getSession } from '@/lib/session';

export async function getMyProfile() {
    const session = await getSession();
    if (!session?.id) return null;

    const user = await caDb.user.findUnique({
        where: { id: String(session.id) },
    });

    return user;
}

// ------------------------------------------------------------------
// 3. 프로필 수정
// ------------------------------------------------------------------
interface UpdateProfilePayload {
    username: string;
    userId: string;
    email?: string | null;
    phone?: string | null;
    password?: string; // 입력 시 새 비밀번호
}

export async function updateMyProfile(data: UpdateProfilePayload) {
    const session = await getSession();
    if (!session?.id) return { success: false, error: 'Unauthorized' };

    const updateData: any = {
        username: data.username,
        userId: data.userId,
        email: data.email,
        phone: data.phone,
        updatedAt: new Date(),
    };

    if (data.password && data.password.trim().length > 0) {
        updateData.password = await bcrypt.hash(data.password, 10);
    }

    await caDb.user.update({
        where: { id: String(session.id) },
        data: updateData,
    });

    return { success: true };
}
