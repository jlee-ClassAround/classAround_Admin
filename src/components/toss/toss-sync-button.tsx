import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { LoadingOverlay } from '../sync-toss-payments/loading-overlay';

export function TossSyncButton({ courseId, type }: { courseId: string; type: string }) {
    const [loading, setLoading] = useState(false);

    const handleSync = async () => {
        setLoading(true);

        try {
            const url = type === 'ivy' ? '/api/ivy/toss-sync' : '/api/cojooboo/toss-sync';

            const res = await fetch(`${url}?courseId=${courseId}`, {
                method: 'POST',
            });

            if (!res.ok) {
                alert('❌ 토스 결제 동기화 중 오류 발생');
                setLoading(false);

                return;
            }

            const data = await res.json();

            alert(`토스 결제 동기화 완료\n업데이트: ${data.updatedCount}건`);
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert('⚠️ 요청 중 오류 발생');
        } finally {
            setLoading(false); // 🔥 로딩 종료
        }
    };

    return (
        <>
            <Button variant="outline" onClick={handleSync} disabled={loading}>
                {loading ? '동기화 중...' : '토스 결제 상태 검증'}
            </Button>

            {/* 🔥 전체화면 로딩 오버레이 */}
            <LoadingOverlay show={loading} />
        </>
    );
}
