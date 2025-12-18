import { NextRequest, NextResponse } from 'next/server';

import { buildDesiredStateFromTossCustomer } from './actions/buildDesiredStateFromTossCustomer';
import { cojoobooDb } from '@/lib/cojoobooDb';

type ApiResponse = {
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

function clampInt(value: number, min: number, max: number): number {
    if (Number.isNaN(value)) return min;
    return Math.max(min, Math.min(max, value));
}

/**
 * ✅ courseId가 들어오면:
 * - 만약 그게 자식 강의면: parentId를 root로 잡고 (부모 + 형제들)까지 포함
 * - 만약 그게 부모 강의면: (부모 + 자식들) 포함
 * - 못찾으면: 그냥 courseId 단일로 처리
 */
async function getScopedCourseIds(courseId: string): Promise<string[]> {
    const base = await cojoobooDb.course.findUnique({
        where: { id: courseId },
        select: { id: true, parentId: true },
    });

    const rootId = base?.parentId ?? base?.id ?? courseId;

    const scoped = await cojoobooDb.course.findMany({
        where: {
            OR: [{ id: rootId }, { parentId: rootId }],
        },
        select: { id: true },
    });

    const ids = scoped.map((c) => c.id);
    return ids.length > 0 ? ids : [courseId];
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
    const url = new URL(req.url);

    const limit = clampInt(Number(url.searchParams.get('limit') ?? '50'), 1, 200);
    const cursor = url.searchParams.get('cursor');
    const courseId = url.searchParams.get('courseId');
    const dryRun = (url.searchParams.get('dryRun') ?? '1') === '1';

    try {
        // ✅ 여기서 부모/자식 스코프 courseIds 확장
        const scopedCourseIds = courseId ? await getScopedCourseIds(courseId) : null;

        const tossCustomers = await cojoobooDb.tossCustomer.findMany({
            where: scopedCourseIds ? { courseId: { in: scopedCourseIds } } : undefined,
            orderBy: { id: 'asc' },
            take: limit + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        });

        const hasNext = tossCustomers.length > limit;
        const pageItems = hasNext ? tossCustomers.slice(0, limit) : tossCustomers;
        const nextCursor = hasNext ? pageItems[pageItems.length - 1]?.id ?? null : null;

        let processedCount = 0;
        let updatedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        const updated: ApiResponse['updated'] = [];
        const skipped: ApiResponse['skipped'] = [];
        const errors: ApiResponse['errors'] = [];

        for (const tc of pageItems) {
            processedCount += 1;

            try {
                // ✅ 1) Payment를 paymentKey(=tossPaymentKey)로 먼저 찾는다 (가장 안전)
                const paymentWithOrder = await cojoobooDb.payment.findUnique({
                    where: { tossPaymentKey: tc.paymentKey },
                    include: {
                        order: {
                            include: { payments: true },
                        },
                    },
                });

                if (!paymentWithOrder) {
                    skippedCount += 1;
                    skipped.push({
                        tossCustomerId: tc.id,
                        reason: `Payment not found by tossPaymentKey: ${tc.paymentKey}`,
                    });
                    continue;
                }

                const payment = paymentWithOrder;
                const order = paymentWithOrder.order;

                // ✅ 2) TossCustomer 기준 “원하는 상태/필드” 계산
                const desired = buildDesiredStateFromTossCustomer(tc, order, payment);

                if (!desired.shouldUpdate) {
                    skippedCount += 1;
                    skipped.push({
                        tossCustomerId: tc.id,
                        reason: desired.reason ?? 'No changes',
                    });
                    continue;
                }

                const before = {
                    orderStatus: String(order.status),
                    paymentStatus: String(payment.paymentStatus),
                };
                const after = {
                    orderStatus: String(desired.orderPatch.status ?? order.status),
                    paymentStatus: String(
                        desired.paymentPatch.paymentStatus ?? payment.paymentStatus
                    ),
                };

                // ✅ 3) 실제 업데이트
                if (!dryRun) {
                    await cojoobooDb.$transaction([
                        cojoobooDb.order.update({
                            where: { id: order.id },
                            data: desired.orderPatch,
                        }),
                        cojoobooDb.payment.update({
                            where: { id: payment.id },
                            data: desired.paymentPatch,
                        }),
                    ]);
                }

                updatedCount += 1;
                updated.push({
                    tossCustomerId: tc.id,
                    orderId: order.id,
                    paymentId: payment.id,
                    before,
                    after,
                });
            } catch (e: unknown) {
                errorCount += 1;
                const msg = e instanceof Error ? e.message : String(e);
                errors.push({ tossCustomerId: tc.id, reason: msg });
            }
        }

        return NextResponse.json({
            success: true,
            requested: {
                courseId: courseId ?? null,
                limit,
                cursor: cursor ?? null,
                dryRun,
            },
            processedCount,
            updatedCount,
            skippedCount,
            errorCount,
            nextCursor,
            updated,
            skipped,
            errors,
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}
