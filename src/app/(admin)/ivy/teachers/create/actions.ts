'use server';

import { ivyDb } from '@/lib/ivyDb';
import { teacherSchema } from '@/lib/ivy/schemas';
import { redirect } from 'next/navigation';
import { revalidateTag } from 'next/cache';

export async function createTeacherAction(_: any, formData: FormData) {
    const data = Object.fromEntries(formData);

    const result = teacherSchema.safeParse(data);
    if (!result.success) {
        return {
            errors: result.error.flatten().fieldErrors,
        };
    }

    const teacher = await ivyDb.teacher.create({
        data: {
            name: result.data.name,
        },
        select: {
            id: true,
        },
    });

    revalidateTag('main-teachers');
    revalidateTag('teachers');

    return redirect(`/ivy/teachers/${teacher.id}`);
}
