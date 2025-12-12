'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { LoadingOverlay } from './loading-overlay';
import { syncTossPayments } from './action';

export function TossSyncButton({ courseId }: { courseId: string }) {
    const [loading, setLoading] = useState(false);

    const handleSync = async () => {
        setLoading(true);
        try {
            const result = await syncTossPayments(courseId);

            if (!result.success) {
                alert(`토스 결제 동기화 중 오류 발생\n${result.error}`);
                return;
            }

            alert(`토스 결제 동기화 완료\n업데이트: ${result.updatedCount}건`);
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert('요청 중 오류 발생');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button variant="outline" onClick={handleSync} disabled={loading}>
                {loading ? '동기화 중...' : '토스 결제 상태 검증'}
            </Button>

            <LoadingOverlay show={loading} />
        </>
    );
}
