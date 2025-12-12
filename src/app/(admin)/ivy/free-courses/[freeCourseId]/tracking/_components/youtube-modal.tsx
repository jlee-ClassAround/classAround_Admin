'use client';

import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { toast } from 'sonner';
import { updateTrackingPublishedAt } from '../_actions/update-published-at';

export function YoutubeModal() {
    const [open, setOpen] = useState(false);
    const [trackingId, setTrackingId] = useState<string | null>(null);
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);

    // 🔥 columns.ts에서 보내는 이벤트 감지
    useEffect(() => {
        const handler = (e: any) => {
            setTrackingId(e.detail.trackingId);
            setOpen(true);
        };

        window.addEventListener('open-youtube-modal', handler);
        return () => window.removeEventListener('open-youtube-modal', handler);
    }, []);

    const closeModal = () => {
        setOpen(false);
        setUrl('');
    };

    const handleSave = async () => {
        if (!trackingId) return;

        try {
            setLoading(true);

            const res = await updateTrackingPublishedAt(trackingId, url);

            if (res.success) {
                toast.success('유튜브 게시일이 저장되었습니다.');
            } else {
                toast.error(res.message || '저장 중 오류가 발생했습니다.');
            }
        } catch (e) {
            toast.error('유튜브 정보 저장 실패');
        } finally {
            setLoading(false);
            closeModal();

            window.location.reload();
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>유튜브 링크 등록</DialogTitle>
                    <DialogDescription>
                        이 트래킹 코드에 연결될 유튜브 영상 링크를 입력하세요.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    <Input
                        placeholder="https://youtube.com/..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={closeModal} disabled={loading}>
                        취소
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? '저장 중...' : '저장'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
