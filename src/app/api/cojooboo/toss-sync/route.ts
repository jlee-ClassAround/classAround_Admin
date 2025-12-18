import { NextResponse } from 'next/server';
import { cojoobooDb } from '@/lib/cojoobooDb';
import { getIsAdmin } from '@/lib/is-admin';
import { getEncryptedSecretKey } from '@/external-api/tosspayments/services/get-encrypted-secret-key';
import type { TossPayment, Cancel } from '@/external-api/tosspayments/types/tosspayment-object';

type DbStatus = 'COMPLETED' | 'REFUNDED' | 'PARTIAL_REFUNDED' | 'WAITING_FOR_DEPOSIT';

const mapStatus: Record<string, DbStatus> = {
    DONE: 'COMPLETED',
    CANCELED: 'REFUNDED',
    PARTIAL_CANCELED: 'PARTIAL_REFUNDED',
    WAITING_FOR_DEPOSIT: 'WAITING_FOR_DEPOSIT',
};

function getTotalCancelAmount(cancels: Cancel[] | null | undefined): number {
    if (!cancels || cancels.length === 0) return 0;
    return cancels.reduce((sum, c) => sum + (c.cancelAmount ?? 0), 0);
}

function getLastCanceledAt(cancels: Cancel[] | null | undefined): Date | null {
    if (!cancels || cancels.length === 0) return null;
    return new Date(cancels[cancels.length - 1].canceledAt);
}

function toInt(value: string | null, fallback: number): number {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

export async function POST(req: Request) {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);

        const courseId: string | null = searchParams.get('courseId');
        const cursor: string | null = searchParams.get('cursor'); // tossCustomer.id
        const limit: number = Math.min(200, Math.max(1, toInt(searchParams.get('limit'), 50)));

        // ✅ paymentKey는 스키마에서 NOT NULL이면 where에서 { not: null } 쓰면 TS 에러남
        // ✅ FREE-로 시작하는 orderId는 토스에 없으니 제외
        const where = {
            ...(courseId ? { courseId } : {}),
            NOT: {
                orderId: { startsWith: 'FREE-' },
            },
        } as const;

        const rows = await cojoobooDb.tossCustomer.findMany({
            where,
            take: limit,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            orderBy: { id: 'asc' },
            select: {
                id: true,
                orderId: true,
                paymentKey: true,
                paymentStatus: true,
                finalPrice: true,
                refundableAmount: true,
                cancelAmount: true,
                canceledAt: true,
            },
        });

        const updated: Array<{ id: string; orderId: string; before: string; after: string }> = [];
        const errors: Array<{ id: string; orderId: string; paymentKey: string; error: string }> =
            [];
        let skippedCount = 0;

        for (const p of rows) {
            // 혹시라도 paymentKey가 비정상인 row가 있으면 스킵
            if (!p.paymentKey) {
                skippedCount += 1;
                continue;
            }

            const res = await fetch(
                `https://api.tosspayments.com/v1/payments/${encodeURIComponent(p.paymentKey)}`,
                { method: 'GET', headers: { Authorization: getEncryptedSecretKey() } }
            );

            if (!res.ok) {
                errors.push({
                    id: p.id,
                    orderId: p.orderId,
                    paymentKey: p.paymentKey,
                    error: `Toss API HTTP ${res.status}`,
                });
                continue;
            }

            const toss = (await res.json()) as TossPayment;

            const newStatus: string = mapStatus[toss.status] ?? toss.status;
            const newFinalPrice: number = toss.totalAmount ?? 0;
            const newRefundableAmount: number | null =
                typeof toss.balanceAmount === 'number' ? toss.balanceAmount : null;
            const newCancelAmount: number = getTotalCancelAmount(toss.cancels);
            const newCanceledAt: Date | null = getLastCanceledAt(toss.cancels);

            const needUpdate =
                p.paymentStatus !== newStatus ||
                p.finalPrice !== newFinalPrice ||
                (p.refundableAmount ?? null) !== newRefundableAmount ||
                (p.cancelAmount ?? 0) !== newCancelAmount ||
                (p.canceledAt?.toISOString() ?? null) !== (newCanceledAt?.toISOString() ?? null);

            if (!needUpdate) continue;

            await cojoobooDb.tossCustomer.update({
                where: { id: p.id },
                data: {
                    paymentStatus: newStatus,
                    finalPrice: newFinalPrice,
                    refundableAmount: newRefundableAmount,
                    cancelAmount: newCancelAmount,
                    canceledAt: newCanceledAt,
                },
            });

            updated.push({
                id: p.id,
                orderId: p.orderId,
                before: p.paymentStatus,
                after: newStatus,
            });
        }

        const nextCursor: string | null = rows.length === limit ? rows[rows.length - 1].id : null;

        return NextResponse.json({
            success: true,
            scope: 'cojooboo',
            requested: { courseId, limit, cursor },
            processedCount: rows.length,
            updatedCount: updated.length,
            skippedCount,
            errorCount: errors.length,
            nextCursor,
            updated,
            errors,
        });
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}
