import { cojoobooDb } from '@/lib/cojoobooDb';
import { TeacherForm } from './_components/teacher-form';
import { redirect } from 'next/navigation';
import { getCategories } from '../../_actions/categories/get-categories';

export default async function TeacherIdPage({
    params,
}: {
    params: Promise<{ teacherId: string }>;
}) {
    const { teacherId } = await params;

    const teacher = await cojoobooDb.teacher.findUnique({
        where: {
            id: teacherId,
        },
    });
    if (!teacher) {
        return redirect('/cojooboo/teachers/all');
    }

    const categories = await getCategories({ type: 'TEACHER' });

    return (
        <div>
            <TeacherForm initialData={teacher} categories={categories} />
        </div>
    );
}
