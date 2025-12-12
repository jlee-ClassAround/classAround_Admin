'use server';

import { mysqlDb } from '@/lib/mysqlDb';
import axios from 'axios';

function extractVideoId(url: string): string | null {
    try {
        const parsed = new URL(url);

        if (parsed.hostname.includes('youtu.be')) {
            return parsed.pathname.slice(1);
        }

        if (parsed.hostname.includes('youtube.com')) {
            return parsed.searchParams.get('v');
        }
    } catch (e) {
        return null;
    }

    return null;
}

async function fetchPublishedAt(videoId: string): Promise<Date | null> {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) throw new Error('유튜브 API 키가 설정되지 않았습니다.');

    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`;

    const res = await axios.get(url);

    if (
        res.data &&
        res.data.items &&
        res.data.items.length > 0 &&
        res.data.items[0].snippet?.publishedAt
    ) {
        return new Date(res.data.items[0].snippet.publishedAt);
    }

    return null;
}

export async function updateTrackingPublishedAt(trackingId: string, youtubeUrl: string) {
    try {
        const videoId = extractVideoId(youtubeUrl);

        if (!videoId) {
            throw new Error('유효한 유튜브 링크가 아닙니다.');
        }

        const publishedAt = await fetchPublishedAt(videoId);

        if (!publishedAt) {
            throw new Error('유튜브 영상 게시일을 가져올 수 없습니다.');
        }

        // Update DB
        await mysqlDb.tracking.update({
            where: { id: trackingId },
            data: { published_at: publishedAt },
        });

        return {
            success: true,
            publishedAt,
        };
    } catch (e: any) {
        console.error(e);
        return {
            success: false,
            message: e.message || '오류가 발생했습니다.',
        };
    }
}
