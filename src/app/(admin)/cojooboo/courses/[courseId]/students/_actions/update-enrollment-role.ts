'use server';

import { cojoobooDb } from '@/lib/cojoobooDb'; // 혹은 브랜드별 DB

export async function updateEnrollmentRoleAction(enrollmentId: string, role: string | null) {
    try {
        // 실제 구현 시 세션 권한 체크가 필요합니다.
        await cojoobooDb.enrollment.update({
            where: { id: enrollmentId },
            data: { role },
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: '역할 수정 중 오류가 발생했습니다.' };
    }
}
