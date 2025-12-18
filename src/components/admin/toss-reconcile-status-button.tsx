'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ReconcileApiResponse = {
    success: boolean;
    requested?: {
        courseId: string | null;
        limit: number;
        cursor: string | null;
        dryRun: boolean;
    };
    processedCount?: number;
    updatedCount?: number;
    skippedCount?: number;
    errorCount?: number;
    nextCursor?: string | null;
    updated?: Array<{
        tossCustomerId: string;
        orderId: string;
        paymentId: string;
        before: { orderStatus: string; paymentStatus: string };
        after: { orderStatus: string; paymentStatus: string };
    }>;
    skipped?: Array<{ tossCustomerId: string; reason: string }>;
    errors?: Array<{ tossCustomerId?: string; reason: string }>;
    error?: string;
};

export interface TossReconcileStatusButtonProps {
    /** 특정 courseId만 보정하고 싶을 때 */
    courseId?: string;
    /** 배치 사이즈(서버 take). 1~200 권장 */
    limit?: number;
    /** true면 실제 업데이트 없이 변경안만 확인 */
    dryRun?: boolean;
    /** 버튼 라벨 */
    label?: string;
    /** className */
    className?: string;
}

export function TossReconcileStatusButton({
    courseId,
    limit = 50,
    dryRun = true,
    label = '주문/결제 상태 정합성 보정',
    className,
}: TossReconcileStatusButtonProps) {
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
            const sp = new URLSearchParams();
            sp.set('limit', String(limit));
            sp.set('dryRun', dryRun ? '1' : '0');
            if (courseId) sp.set('courseId', courseId);
            if (cursor) sp.set('cursor', cursor);
            return `/api/cojooboo/toss-reconcile-status?${sp.toString()}`;
        },
        [courseId, dryRun, limit]
    );

    const run = React.useCallback(async () => {
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
                `▶️ 시작: /api/cojooboo/toss-reconcile-status (limit=${limit}, dryRun=${
                    dryRun ? 'true' : 'false'
                }${courseId ? `, courseId=${courseId}` : ''})`
            );

            let cursor: string | null = null;
            let page = 0;

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
                    headers: { 'Content-Type': 'application/json' },
                });

                const json = (await res.json()) as ReconcileApiResponse;

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

                // 필요하면 변경 내역 일부 로그로 찍기(너무 길어지면 주석 처리)
                if (json.updated?.length) {
                    const sample = json.updated.slice(0, 3);
                    for (const u of sample) {
                        appendLog(
                            `  - ${u.orderId} | order: ${u.before.orderStatus} → ${u.after.orderStatus}, payment: ${u.before.paymentStatus} → ${u.after.paymentStatus}`
                        );
                    }
                    if (json.updated.length > sample.length) {
                        appendLog(`  …(${json.updated.length - sample.length}건 더 있음)`);
                    }
                }

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
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            appendLog(`❌ 예외: ${msg}`);
        } finally {
            abortRef.current = null;
            setIsRunning(false);
        }
    }, [appendLog, buildUrl, courseId, dryRun, limit]);

    const stop = React.useCallback(() => {
        abortRef.current?.abort();
    }, []);

    return (
        <div className={cn('space-y-2', className)}>
            <div className="flex flex-wrap items-center gap-2">
                <Button type="button" onClick={run} disabled={isRunning}>
                    {isRunning ? '보정 중…' : label}
                </Button>

                <Button type="button" variant="outline" onClick={stop} disabled={!isRunning}>
                    중단
                </Button>

                <span className="text-sm text-muted-foreground">
                    mode: <b>{dryRun ? 'dry-run' : 'apply'}</b>
                    {courseId ? (
                        <>
                            {' '}
                            · courseId: <code className="text-xs">{courseId}</code>
                        </>
                    ) : null}
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
