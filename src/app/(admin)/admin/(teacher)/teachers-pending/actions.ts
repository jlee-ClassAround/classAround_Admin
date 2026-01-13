'use server';

import { caDb } from '@/lib/caDb';
import { revalidatePath } from 'next/cache';

export type ActionResult = { ok: true } | { ok: false; message: string };

export async function approveAdminAction(formData: FormData): Promise<ActionResult> {
    const teacherId = formData.get('teacherId')?.toString();

    if (!teacherId) return { ok: false, message: 'Invalid teacherId' };

    try {
        await caDb.teacher.update({
            where: { id: teacherId },
            data: { isRegist: true },
        });

        // ✅ 목록 페이지 캐시 갱신
        revalidatePath('/admin/teachers-pending');

        return { ok: true };
    } catch (e) {
        console.error('[approveAdminAction]', e);
        return { ok: false, message: '승인 처리에 실패했습니다.' };
    }
}

export async function rejectAdminAction(formData: FormData): Promise<ActionResult> {
    const teacherId = formData.get('teacherId')?.toString();

    if (!teacherId) return { ok: false, message: 'Invalid teacherId' };

    try {
        await caDb.teacher.delete({
            where: { id: teacherId },
        });

        revalidatePath('/admin/teachers-pending');

        return { ok: true };
    } catch (e) {
        console.error('[rejectAdminAction]', e);
        return { ok: false, message: '거절 처리에 실패했습니다.' };
    }
}

export async function linkTeacherAction(authTeacherId: string, linkedTId: string) {
    try {
        await caDb.teacher.update({
            where: { id: authTeacherId },
            data: { tId: linkedTId },
        });
        revalidatePath('/admin/pending-teachers');
        return { success: true };
    } catch (error) {
        return { success: false, error: '연결 중 오류가 발생했습니다.' };
    }
}
