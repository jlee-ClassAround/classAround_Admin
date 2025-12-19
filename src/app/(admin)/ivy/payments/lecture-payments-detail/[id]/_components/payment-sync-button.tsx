'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type SyncApiResponse = {
    success: boolean;
    nextCursor?: string | null;
    error?: string;
};

type ReconcileApiResponse = {
    success: boolean;
    nextCursor?: string | null;
    error?: string;
};

export interface TossCourseRepairButtonProps {
    courseId: string;
    syncLimit?: number;
    reconcileLimit?: number;
    dryRun?: boolean;
    label?: string;
    className?: string;
}

function clampInt(value: number, min: number, max: number): number {
    if (Number.isNaN(value)) return min;
    return Math.max(min, Math.min(max, value));
}

export function TossCourseRepairButton({
    courseId,
    syncLimit = 50,
    reconcileLimit = 50,
    dryRun = true,
    label = '결제싱크버튼',
    className,
}: TossCourseRepairButtonProps) {
    const [isRunning, setIsRunning] = React.useState<boolean>(false);
    const [phase, setPhase] = React.useState<'idle' | 'sync' | 'reconcile'>('idle');

    const abortRef = React.useRef<AbortController | null>(null);

    const buildSyncUrl = React.useCallback(
        (cursor: string | null) => {
            const sp = new URLSearchParams();
            sp.set('limit', String(clampInt(syncLimit, 1, 200)));
            sp.set('courseId', courseId);
            if (cursor) sp.set('cursor', cursor);
            return `/api/ivy/toss-sync?${sp.toString()}`;
        },
        [courseId, syncLimit]
    );

    const buildReconcileUrl = React.useCallback(
        (cursor: string | null) => {
            const sp = new URLSearchParams();
            sp.set('limit', String(clampInt(reconcileLimit, 1, 200)));
            sp.set('dryRun', dryRun ? '1' : '0');
            sp.set('courseId', courseId);
            if (cursor) sp.set('cursor', cursor);
            return `/api/ivy/toss-reconcile-status?${sp.toString()}`;
        },
        [courseId, dryRun, reconcileLimit]
    );

    const runSync = React.useCallback(
        async (ac: AbortController): Promise<void> => {
            setPhase('sync');

            let cursor: string | null = null;

            while (true) {
                if (ac.signal.aborted) return;

                const res = await fetch(buildSyncUrl(cursor), {
                    method: 'POST',
                    signal: ac.signal,
                    headers: { 'Content-Type': 'application/json' },
                });

                const json = (await res.json()) as SyncApiResponse;

                if (!res.ok || !json.success) {
                    throw new Error(json.error ?? `toss-sync HTTP ${res.status}`);
                }

                cursor = json.nextCursor ?? null;
                if (!cursor) return;
            }
        },
        [buildSyncUrl]
    );

    const runReconcile = React.useCallback(
        async (ac: AbortController): Promise<void> => {
            setPhase('reconcile');

            let cursor: string | null = null;

            while (true) {
                if (ac.signal.aborted) return;

                const res = await fetch(buildReconcileUrl(cursor), {
                    method: 'POST',
                    signal: ac.signal,
                    headers: { 'Content-Type': 'application/json' },
                });

                const json = (await res.json()) as ReconcileApiResponse;

                if (!res.ok || !json.success) {
                    throw new Error(json.error ?? `reconcile HTTP ${res.status}`);
                }

                cursor = json.nextCursor ?? null;
                if (!cursor) return;
            }
        },
        [buildReconcileUrl]
    );

    const run = React.useCallback(async () => {
        if (!courseId || isRunning) return;

        setIsRunning(true);
        setPhase('sync');

        const ac = new AbortController();
        abortRef.current = ac;

        const loadingId = toast.loading('결제 동기화 시작…');

        try {
            await runSync(ac);
            if (ac.signal.aborted) {
                toast.dismiss(loadingId);
                toast('동기화가 중단되었습니다.');
                return;
            }

            toast.loading('상태 보정 진행 중…', { id: loadingId });
            await runReconcile(ac);

            if (ac.signal.aborted) {
                toast.dismiss(loadingId);
                toast('동기화가 중단되었습니다.');
                return;
            }

            toast.success('동기화가 완료되었습니다.', {
                id: loadingId,
                description: dryRun
                    ? 'dry-run 모드로 상태 보정은 미리보기만 실행되었습니다.'
                    : '상태 보정까지 적용되었습니다.',
            });
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            toast.error('동기화 실패', {
                id: loadingId,
                description: msg,
            });
        } finally {
            abortRef.current = null;
            setIsRunning(false);
            setPhase('idle');
        }
    }, [courseId, dryRun, isRunning, runReconcile, runSync]);

    const stop = React.useCallback(() => {
        abortRef.current?.abort();
    }, []);

    const buttonText =
        isRunning && phase === 'sync'
            ? '동기화 중…'
            : isRunning && phase === 'reconcile'
            ? '보정 중…'
            : label;

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <Button type="button" onClick={run} disabled={isRunning || !courseId}>
                {buttonText}
            </Button>

            <Button type="button" variant="outline" onClick={stop} disabled={!isRunning}>
                중단
            </Button>
        </div>
    );
}
