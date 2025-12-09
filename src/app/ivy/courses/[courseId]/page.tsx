import { ivyDb } from '@/lib/ivyDb';
import { redirect } from 'next/navigation';
import { CourseForm } from './_components/course-form';
import { OptionModal } from './_components/option-modal';
import { getCategories } from '../../_actions/categories/get-categories';

export default async function CourseIdPage(props: { params: Promise<{ courseId: string }> }) {
    const { courseId } = await props.params;
    const course = await ivyDb.course.findUnique({
        where: {
            id: courseId,
        },
        include: {
            chapters: {
                include: {
                    lessons: true,
                },
            },
            detailImages: {
                orderBy: {
                    position: 'asc',
                },
            },
            category: true,
            teachers: true,
            options: {
                orderBy: {
                    createdAt: 'asc',
                },
            },
            productBadge: true,
        },
    });
    if (!course) return redirect('/ivy/courses/all');

    const categories = await getCategories({ type: 'COURSE' });

    const teachers = await ivyDb.teacher.findMany({
        orderBy: {
            name: 'asc',
        },
    });

    const productBadges = await ivyDb.productBadge.findMany();

    return (
        <>
            <CourseForm
                course={course}
                categories={categories}
                teachers={teachers}
                productBadges={productBadges}
            />
            <OptionModal courseId={courseId} />
        </>
    );
}
