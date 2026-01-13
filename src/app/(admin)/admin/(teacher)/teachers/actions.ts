'use server';

import { caDb } from '@/lib/caDb';
import { cojoobooDb } from '@/lib/cojoobooDb';
import { ivyDb } from '@/lib/ivyDb';

import { SortingState } from '@tanstack/react-table';
import { Prisma } from '@/generated/classaround';

export async function getTeachers({
    currentPage = 1,
    pageSize = 50,
    search = '',
    sort = 'createdAt',
    order = 'desc',
}: {
    currentPage?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
}) {
    const skip = (currentPage - 1) * pageSize;

    const where: Prisma.TeacherWhereInput = {
        ...(search
            ? {
                  OR: [
                      { username: { contains: search, mode: 'insensitive' } },
                      { email: { contains: search, mode: 'insensitive' } },
                      { phone: { contains: search, mode: 'insensitive' } },
                      { brand: { contains: search, mode: 'insensitive' } },
                  ],
              }
            : {}),
    };

    const [teachers, totalCount] = await Promise.all([
        caDb.teacher.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: { [sort]: order },
        }),
        caDb.teacher.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);
    const serverSorting: SortingState = [{ id: sort, desc: order === 'desc' }];

    return {
        teachers,
        totalCount,
        totalPages,
        serverSorting,
    };
}

// ✅ 강사 이미지(profile)와 더불어 소개글(info)을 함께 가져옵니다.
export async function getBrandTeachers(brand: string) {
    try {
        if (brand.toLowerCase() === 'cojooboo') {
            return await cojoobooDb.teacher.findMany({
                select: { id: true, name: true, profile: true, info: true },
                orderBy: { name: 'asc' },
            });
        } else if (brand.toLowerCase() === 'ivy') {
            return await ivyDb.teacher.findMany({
                select: { id: true, name: true, profile: true, info: true },
                orderBy: { name: 'asc' },
            });
        }
        return [];
    } catch (error) {
        console.error(`${brand} 강사 목록 로드 중 오류:`, error);
        return [];
    }
}

export async function updateTeacherAction(
    id: string,
    data: Partial<{ tId: string; brand: string; nickname: string }>
) {
    try {
        await caDb.teacher.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });
        return { success: true };
    } catch (error) {
        console.error('강사 정보 업데이트 오류:', error);
        return { success: false };
    }
}

export async function deleteTeacherAction(id: string) {
    try {
        await caDb.teacher.delete({
            where: { id },
        });
        return { success: true };
    } catch (error) {
        console.error('강사 삭제 오류:', error);
        return { success: false };
    }
}
