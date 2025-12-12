import { mysqlDb } from '@/lib/mysqlDb';

import { format } from 'path';
import { TrackingRow } from '../columns';

export async function getTrackingData(freeCourseId: string): Promise<TrackingRow[]> {
    const lecture = await mysqlDb.lecture.findFirst({
        where: { landing_url: { endsWith: `free-courses/${freeCourseId}` } },
        select: { id: true },
    });

    if (!lecture) return [];

    const rows = await mysqlDb.tracking.findMany({
        where: { lecture_id: lecture.id },
        select: {
            id: true,
            parameter_name: true,
            published_at: true,
            created_at: true,
            medium: { select: { name: true } },
            merchant: { select: { name: true } },
        },
        orderBy: { created_at: 'desc' },
    });

    return rows.map((t) => ({
        id: t.id,
        parameterName: t.parameter_name,
        publishedAt: t.published_at,
        createdAt: t.created_at,
        mediumName: t.medium?.name || null,
        merchantName: t.merchant?.name || null,
    }));
}
