'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SyncScope = 'cojooboo' | 'ivy';

type SyncApiResponse = {
    success: boolean;
    scope?: string;
    requested?: {
        courseId: string | null;
        limit: number;
        cursor: string | null;
    };
    processedCount?: number;
    updatedCount?: number;
    skippedCount?: number;
    errorCount?: number;
    nextCursor?: string | null;
    updated?: unknown[];
    skipped?: unknown[];
    errors?: unknown[];
    error?: string;
};

export interface TossSyncButtonProps {
    /** 경로에서 자동 추론(기본). 강제로 지정하고 싶으면 넣어도 됨 */
    scope?: SyncScope;
    /** 특정 courseId만 동기화하고 싶을 때 */
    courseId?: string;
    /** 배치 사이즈(서버에서 take). 1~200 사이 권장 */
    limit?: number;
    /** 버튼 라벨 */
    label?: string;
    /** className */
    className?: string;
}

export function TossSyncButton({
    scope,
    courseId,
    limit = 50,
    label = '토스 결제 동기화',
    className,
}: TossSyncButtonProps) {
    const pathname = usePathname();

    const inferredScope = React.useMemo<SyncScope | null>(() => {
        const seg = (pathname ?? '').split('/').filter(Boolean)[0] ?? '';
        if (seg === 'cojooboo' || seg === 'ivy') return seg;
        return null;
    }, [pathname]);

    const finalScope: SyncScope | null = scope ?? inferredScope;

    const [isRunning, setIsRunning] = React.useState<boolean>(false);
    const [log, setLog] = React.useState<string>('');
    const [stats, setStats] = React.useState<{
        pages: number;
        processed: number;
        updated: number;
        skipped: number;
        errors: number;
        lastCursor: string | null;
    }>({
        pages: 0,
        processed: 0,
        updated: 0,
        skipped: 0,
        errors: 0,
        lastCursor: null,
    });

    const abortRef = React.useRef<AbortController | null>(null);

    const appendLog = React.useCallback((line: string) => {
        setLog((prev) => (prev ? `${prev}\n${line}` : line));
    }, []);

    const buildUrl = React.useCallback(
        (cursor: string | null): string => {
            if (!finalScope) return '';
            const sp = new URLSearchParams();
            sp.set('limit', String(limit));
            if (courseId) sp.set('courseId', courseId);
            if (cursor) sp.set('cursor', cursor);
            return `/api/${finalScope}/toss-sync?${sp.toString()}`;
        },
        [courseId, finalScope, limit]
    );

    const run = React.useCallback(async () => {
        if (!finalScope) {
            appendLog('❌ scope를 추론할 수 없어요. (URL 첫 세그먼트가 cojooboo/ivy가 아님)');
            return;
        }

        setIsRunning(true);
        setLog('');
        setStats({
            pages: 0,
            processed: 0,
            updated: 0,
            skipped: 0,
            errors: 0,
            lastCursor: null,
        });

        const ac = new AbortController();
        abortRef.current = ac;

        try {
            appendLog(
                `▶️ 시작: scope=${finalScope}, limit=${limit}${
                    courseId ? `, courseId=${courseId}` : ''
                }`
            );

            let cursor: string | null = null;
            let page = 0;

            // nextCursor가 null이 될 때까지 계속 호출
            while (true) {
                if (ac.signal.aborted) {
                    appendLog('🛑 중단됨(사용자)');
                    break;
                }

                page += 1;
                const url = buildUrl(cursor);

                appendLog(`\n#${page} 호출: ${url}`);

                const res = await fetch(url, {
                    method: 'POST',
                    signal: ac.signal,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const json = (await res.json()) as SyncApiResponse;

                if (!res.ok || !json.success) {
                    appendLog(`❌ 실패: ${json.error ?? `HTTP ${res.status}`}`);
                    setStats((s) => ({
                        ...s,
                        pages: page,
                        errors: s.errors + 1,
                        lastCursor: cursor,
                    }));
                    break;
                }

                const processedCount = json.processedCount ?? 0;
                const updatedCount = json.updatedCount ?? 0;
                const skippedCount = json.skippedCount ?? 0;
                const errorCount = json.errorCount ?? 0;

                appendLog(
                    `✅ 처리=${processedCount}, 업데이트=${updatedCount}, 스킵=${skippedCount}, 에러=${errorCount}`
                );

                setStats((s) => ({
                    pages: page,
                    processed: s.processed + processedCount,
                    updated: s.updated + updatedCount,
                    skipped: s.skipped + skippedCount,
                    errors: s.errors + errorCount,
                    lastCursor: json.nextCursor ?? null,
                }));

                cursor = json.nextCursor ?? null;

                if (!cursor) {
                    appendLog('\n✅ 완료: nextCursor=null');
                    break;
                }
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            appendLog(`❌ 예외: ${msg}`);
        } finally {
            abortRef.current = null;
            setIsRunning(false);
        }
    }, [appendLog, buildUrl, courseId, finalScope, limit]);

    const stop = React.useCallback(() => {
        abortRef.current?.abort();
    }, []);

    return (
        <div className={cn('space-y-2', className)}>
            <div className="flex items-center gap-2">
                <Button type="button" onClick={run} disabled={isRunning || !finalScope}>
                    {isRunning ? '동기화 중…' : label}
                </Button>

                <Button type="button" variant="outline" onClick={stop} disabled={!isRunning}>
                    중단
                </Button>

                <span className="text-sm text-muted-foreground">
                    scope: <b>{finalScope ?? '알 수 없음'}</b>
                </span>
            </div>

            <div className="text-sm text-muted-foreground">
                페이지: <b>{stats.pages}</b> · 처리: <b>{stats.processed}</b> · 업데이트:{' '}
                <b>{stats.updated}</b> · 스킵: <b>{stats.skipped}</b> · 에러: <b>{stats.errors}</b>
                {stats.lastCursor ? (
                    <>
                        {' '}
                        · nextCursor: <code className="text-xs">{stats.lastCursor}</code>
                    </>
                ) : null}
            </div>

            <pre className="max-h-64 overflow-auto rounded-md border p-3 text-xs leading-5">
                {log || '로그가 여기에 표시됩니다.'}
            </pre>
        </div>
    );
}
