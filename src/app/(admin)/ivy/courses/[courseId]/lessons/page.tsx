import { Card } from '@/components/ui/card';
import { redirect } from 'next/navigation';
import { ChapterAction } from './_components/chapter-action';
import { ivyDb } from '@/lib/ivyDb';

export default async function AdminLessonsPage({
    params,
}: {
    params: Promise<{ courseId: string }>;
}) {
    const { courseId } = await params;
    const course = await ivyDb.course.findUnique({
        where: {
            id: courseId,
        },
        include: {
            chapters: {
                orderBy: {
                    position: 'asc',
                },
                include: {
                    lessons: {
                        orderBy: {
                            position: 'asc',
                        },
                    },
                },
            },
        },
    });
    if (!course) return redirect(`/ivy/courses/all`);

    return (
        <Card className="p-8">
            <ChapterAction courseId={course.id} chapters={course.chapters} />
        </Card>
    );
}
