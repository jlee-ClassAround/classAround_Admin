'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import { getIsAdmin } from '@/lib/is-admin';
import { CourseSchema } from '@/lib/cojooboo/schemas';
import { DetailImageType } from '@/store/use-detail-images';
import { TeacherType } from '@/store/use-select-teachers';
import { revalidateTag } from 'next/cache';
import z from 'zod';
import { v4 as uuidv4 } from 'uuid';

// ===============================
//  📌 강의 수정 (PUT)
// ===============================
export async function updateCourseAction(
    courseId: string,
    values: CourseSchema,
    images: DetailImageType[],
    teachers: TeacherType[]
) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) {
            return { success: false, error: 'Unauthorized' };
        }

        const { productBadgeIds, ...data } = values;

        const course = await cojoobooDb.course.update({
            where: { id: courseId },
            data: {
                ...data,
                detailImages: {
                    deleteMany: {},
                    create: images.map((image, index) => ({
                        name: image.name,
                        imageUrl: image.imageUrl,
                        position: index + 1,
                    })),
                },
                teachers: {
                    set: teachers.map((teacher) => ({
                        id: teacher.id,
                    })),
                },
                productBadge: {
                    set: productBadgeIds ? productBadgeIds.map((id) => ({ id })) : [],
                },
            },
        });

        // 🔄 캐시 갱신
        revalidateTag('courses');
        revalidateTag('best-courses');
        revalidateTag('free-courses');
        revalidateTag(`course-${courseId}`);
        revalidateTag(`courses-PAID`);

        return { success: true, data: course };
    } catch (error) {
        console.error('[COURSES_UPDATE_ACTION]', error);
        return { success: false, error: 'Internal Server Error' };
    }
}

// ===============================
//  📌 강의 삭제 (DELETE)
// ===============================
export async function deleteCourseAction(courseId: string) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) {
            return { success: false, error: 'Unauthorized' };
        }

        await cojoobooDb.course.delete({
            where: { id: courseId },
        });

        // 🔄 캐시 갱신
        revalidateTag('courses');
        revalidateTag('best-courses');
        revalidateTag('free-courses');
        revalidateTag(`course-${courseId}`);

        return { success: true };
    } catch (error) {
        console.error('[COURSES_DELETE_ACTION]', error);
        return { success: false, error: 'Internal Server Error' };
    }
}

const createCourseSchema = z.object({
    title: z.string().min(1, '제목은 필수입니다.'),
});
export async function createCourseAction(values: z.infer<typeof createCourseSchema>) {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const parsed = createCourseSchema.safeParse(values);
        if (!parsed.success) {
            return { success: false, error: 'Invalid data' };
        }

        const { title } = parsed.data;

        const course = await cojoobooDb.course.create({
            data: { title },
            select: { id: true },
        });

        // 태그 캐시 리빌리데이트
        revalidateTag('courses');
        revalidateTag('best-courses');
        revalidateTag('free-courses');

        return { success: true, id: course.id };
    } catch (e) {
        console.error('[COURSE_CREATE_ERROR]', e);
        return { success: false, error: 'Internal Server Error' };
    }
}

export async function deleteCoursesBulkAction(courseIds: string[]) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) {
            return { success: false, error: 'Unauthorized' };
        }

        await cojoobooDb.course.deleteMany({
            where: {
                id: { in: courseIds },
            },
        });

        revalidateTag('courses');
        revalidateTag('best-courses');
        revalidateTag('free-courses');

        courseIds.forEach((courseId) => {
            revalidateTag(`course-${courseId}`);
        });

        return { success: true };
    } catch (e) {
        console.error('[COURSES_BULK_DELETE_ERROR]', e);
        return { success: false, error: 'Internal Server Error' };
    }
}

export async function duplicateCourseAction(courseId: string, isIncludeChapters: boolean) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) {
            return { success: false, error: 'Unauthorized' };
        }

        // 기존 강의 조회
        const course = await cojoobooDb.course.findUnique({
            where: { id: courseId },
            include: {
                chapters: {
                    include: { lessons: true },
                },
            },
        });

        if (!course) {
            return { success: false, error: 'Course not found' };
        }

        const { chapters, ...courseData } = course;

        // 기본 강의 복제
        const newCourse = await cojoobooDb.course.create({
            data: {
                ...courseData,
                id: uuidv4(),
                title: `${course.title}-복제됨`,
                isPublished: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            select: { id: true },
        });

        // 챕터 + 레슨 복제
        if (isIncludeChapters) {
            for (const chapter of chapters) {
                const { lessons, ...chapterData } = chapter;

                const newChapter = await cojoobooDb.chapter.create({
                    data: {
                        ...chapterData,
                        id: uuidv4(),
                        courseId: newCourse.id,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    select: { id: true },
                });

                if (lessons.length > 0) {
                    await cojoobooDb.lesson.createMany({
                        data: lessons.map((lesson) => ({
                            ...lesson,
                            id: uuidv4(),
                            chapterId: newChapter.id,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        })),
                    });
                }
            }
        }

        // 🔄 캐시 갱신
        revalidateTag('courses');
        revalidateTag('best-courses');
        revalidateTag('free-courses');

        return { success: true, id: newCourse.id };
    } catch (error) {
        console.error('[COURSE_DUPLICATE_ERROR]', error);
        return { success: false, error: 'Internal Server Error' };
    }
}

export async function getMainCoursesAction() {
    try {
        const courses = await cojoobooDb.course.findMany({
            where: { parentId: null }, // 부모가 없는 것만
            select: { id: true, title: true },
            orderBy: { title: 'asc' },
        });
        return { success: true, data: courses };
    } catch (error) {
        return { success: false, error: '목록을 불러오지 못했습니다.' };
    }
}

export async function updateParentIdBulkAction(courseIds: string[], parentId: string | null) {
    try {
        await cojoobooDb.course.updateMany({
            where: { id: { in: courseIds } },
            data: { parentId },
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: '수정 중 오류가 발생했습니다.' };
    }
}
