import { ivyDb } from '@/lib/ivyDb';
import { redirect } from 'next/navigation';
import { FreeCourseForm } from './_components/free-course-form';
import { getCategories } from '../../_actions/categories/get-categories';

export default async function FreeCourseIdPage(props: {
    params: Promise<{ freeCourseId: string }>;
}) {
    const { freeCourseId } = await props.params;
    const freeCourse = await ivyDb.freeCourse.findUnique({
        where: {
            id: freeCourseId,
        },
        include: {
            detailImages: {
                orderBy: {
                    position: 'asc',
                },
            },
            category: true,
            teachers: true,
            productBadge: true,
        },
    });
    if (!freeCourse) return redirect('/ivy/free-courses/all');

    const categories = await getCategories({ type: 'FREE_COURSE' });

    const teachers = await ivyDb.teacher.findMany({
        orderBy: {
            name: 'asc',
        },
    });

    const productBadges = await ivyDb.productBadge.findMany();

    // const { data } = await getKajabiTags({ size: 100 });
    // const tags = data?.map((item) => ({
    //   value: item.id,
    //   label: item.attributes.name,
    // }));

    return (
        <>
            <FreeCourseForm
                freeCourse={freeCourse}
                categories={categories}
                teachers={teachers}
                productBadges={productBadges}
                // tags={tags || []}
            />
        </>
    );
}
