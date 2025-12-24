'use server';

import { getIsAdmin } from '@/lib/is-admin';
import { cojoobooDb } from '@/lib/cojoobooDb';

export async function addOption(courseId: string) {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) throw new Error('Unauthorized');

    const existingCount = await cojoobooDb.courseOption.count({
        where: { courseId },
    });

    const orderValue = existingCount === 0 ? 'first' : 'second';
    await cojoobooDb.courseOption.create({
        data: {
            courseId,
            name: '옵션명',
            originalPrice: 0,
            order: orderValue,
        },
    });
}

export async function deleteOption(optionId: string) {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) throw new Error('Unauthorized');

    await cojoobooDb.courseOption.delete({ where: { id: optionId } });
}

export async function getOptions(courseId: string) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) throw new Error('Unauthorized');

        const options = await cojoobooDb.courseOption.findMany({
            where: { courseId },
            orderBy: { createdAt: 'asc' },
            include: {
                _count: {
                    select: {
                        enrollments: true,
                    },
                },
            },
        });

        return options;
    } catch {
        return [];
    }
}

export async function getOption(optionId: string | null) {
    try {
        if (!optionId) return null;
        const isAdmin = await getIsAdmin();
        if (!isAdmin) throw new Error('Unauthorized');

        const option = await cojoobooDb.courseOption.findUnique({
            where: { id: optionId },
        });
        return option;
    } catch {
        return null;
    }
}

export async function updateOption({
    optionId,
    values,
}: {
    optionId: string;
    values: {
        name: string;
        originalPrice: number;
        discountedPrice: number | null;
    };
}) {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) throw new Error('Unauthorized');

    await cojoobooDb.courseOption.update({
        where: { id: optionId },
        data: {
            ...values,
        },
    });
}
