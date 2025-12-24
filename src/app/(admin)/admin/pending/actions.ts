'use server';

import { caDb } from '@/lib/caDb';
import { revalidatePath } from 'next/cache';

export type ActionResult = { ok: true } | { ok: false; message: string };

export async function approveAdminAction(formData: FormData): Promise<ActionResult> {
    const userId = formData.get('userId')?.toString();

    if (!userId) return { ok: false, message: 'Invalid userId' };

    try {
        await caDb.user.update({
            where: { id: userId },
            data: { roleId: 'admin' },
        });

        // ✅ 목록 페이지 캐시 갱신
        revalidatePath('/admin/pending');

        return { ok: true };
    } catch (e) {
        console.error('[approveAdminAction]', e);
        return { ok: false, message: '승인 처리에 실패했습니다.' };
    }
}

export async function rejectAdminAction(formData: FormData): Promise<ActionResult> {
    const userId = formData.get('userId')?.toString();

    if (!userId) return { ok: false, message: 'Invalid userId' };

    try {
        await caDb.user.delete({
            where: { id: userId },
        });

        revalidatePath('/admin/pending');

        return { ok: true };
    } catch (e) {
        console.error('[rejectAdminAction]', e);
        return { ok: false, message: '거절 처리에 실패했습니다.' };
    }
}
