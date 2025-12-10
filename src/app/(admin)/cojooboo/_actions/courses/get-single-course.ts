'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import {
    Category,
    Chapter,
    Course,
    CourseOption,
    DetailImage,
    Lesson,
    Teacher,
    ProductBadge,
} from '@/generated/cojooboo';
import { unstable_cache as nextCache } from 'next/cache';

export interface GetSingleCourse extends Course {
    category: Category | null;
    detailImages: DetailImage[];
    teachers: Teacher[];
    chapters: (Chapter & {
        lessons: Lesson[];
    })[];
    options: (CourseOption & {
        _count: {
            enrollments: number;
        };
    })[];
    productBadge: ProductBadge[];
    _count: {
        enrollments: number;
    };
}

type GetCourseResponse = GetSingleCourse | null;

export async function getSingleCourse(courseId: string): Promise<GetCourseResponse> {
    try {
        const course = await cojoobooDb.course.findUnique({
            where: {
                id: courseId,
                isPublished: true,
            },
            include: {
                category: true,
                chapters: {
                    where: {
                        isPublished: true,
                    },
                    include: {
                        lessons: {
                            where: {
                                isPublished: true,
                            },
                            orderBy: {
                                position: 'asc',
                            },
                        },
                    },
                    orderBy: {
                        position: 'asc',
                    },
                },
                detailImages: {
                    orderBy: {
                        position: 'asc',
                    },
                },
                teachers: true,
                options: {
                    include: {
                        _count: {
                            select: {
                                enrollments: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
                productBadge: true,
                _count: {
                    select: {
                        enrollments: true,
                    },
                },
            },
        });

        return course;
    } catch (e) {
        console.log('[GET_COURSE_ERROR]', e);
        return null;
    }
}

export async function getCachedSingleCourse(courseId: string) {
    const cache = nextCache(getSingleCourse, [`course-${courseId}`], {
        tags: [`course-${courseId}`, 'single-course'],
        revalidate: 60 * 60 * 3,
    });

    return cache(courseId);
}
