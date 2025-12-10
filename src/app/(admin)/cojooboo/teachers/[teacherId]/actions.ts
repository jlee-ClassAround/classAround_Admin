'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import { getIsAdmin } from '@/lib/is-admin';
import { revalidateTag } from 'next/cache';
import { TeacherSchema } from '@/lib/cojooboo/schemas';

export async function updateTeacherAction(teacherId: string, values: TeacherSchema) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) {
            return { success: false, error: 'Unauthorized' };
        }

        await cojoobooDb.teacher.update({
            where: { id: teacherId },
            data: { ...values },
        });

        revalidateTag('main-teachers');
        revalidateTag('teachers');
        revalidateTag(`teacher-${teacherId}`);

        return { success: true };
    } catch (e) {
        console.error('[TEACHER_UPDATE_ACTION]', e);
        return { success: false, error: 'Internal Server Error' };
    }
}

export async function deleteTeacherAction(teacherId: string) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) {
            return { success: false, error: 'Unauthorized' };
        }

        await cojoobooDb.teacher.delete({
            where: { id: teacherId },
        });

        revalidateTag('main-teachers');
        revalidateTag('teachers');
        revalidateTag(`teacher-${teacherId}`);

        return { success: true };
    } catch (e) {
        console.error('[TEACHER_DELETE_ACTION]', e);
        return { success: false, error: 'Internal Server Error' };
    }
}

export async function deleteManyTeachersAction(ids: string[]) {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) return { success: false, error: 'Unauthorized' };

    try {
        await cojoobooDb.teacher.deleteMany({
            where: { id: { in: ids } },
        });

        revalidateTag('teachers');

        return { success: true };
    } catch (e) {
        console.error('[DELETE_MANY_TEACHERS_ACTION]', e);
        return { success: false, error: 'Internal Server Error' };
    }
}
