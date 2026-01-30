import { cojoobooDb } from '@/lib/cojoobooDb';
import SyncClientSection from './_components/sync-client-section';

export default async function SyncPaymentsPage() {
    // 1. 서버에서 강의 목록을 미리 가져옵니다.
    const courses = await cojoobooDb.course.findMany({
        where: {
            parentId: null,
        },
        select: {
            id: true,
            title: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">
                    강의별 결제 데이터 보정 (Custom)
                </h2>
            </div>

            <div className="grid gap-4">
                {/* 2. 클라이언트 섹션에 데이터를 전달합니다. */}
                <SyncClientSection courses={courses} />
            </div>
        </div>
    );
}
