'use server';

import { UserRepository } from '@/repositories/user-repository';
import { type BrandType } from '@/types/common';

export async function getUsers(brand: BrandType) {
    try {
        const repo = new UserRepository(brand);
        const users = await repo.findMany();
        return { success: true, data: users };
    } catch (error) {
        console.error('[GET_USERS_ERROR]', error);
        return { success: false, error: '사용자 조회에 실패했습니다.' };
    }
}

export async function getUserById(brand: BrandType, id: string) {
    try {
        const repo = new UserRepository(brand);
        const user = await repo.findById(id);

        if (!user) {
            return { success: false, error: '사용자를 찾을 수 없습니다.' };
        }

        return { success: true, data: user };
    } catch (error) {
        console.error('[GET_USER_ERROR]', error);
        return { success: false, error: '사용자 조회에 실패했습니다.' };
    }
}
