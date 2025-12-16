'use server';

import { PrismaClient } from '@prisma/client';
import { getEncryptedSecretKey } from '@/external-api/tosspayments/services/get-encrypted-secret-key';
import { TossPayment, Cancel } from '@/external-api/tosspayments/types/tosspayment-object';

const db = new PrismaClient();

const mapStatus: Record<string, string> = {
    DONE: 'COMPLETED',
    CANCELED: 'REFUNDED',
    PARTIAL_CANCELED: 'PARTIAL_REFUNDED',
    WAITING_FOR_DEPOSIT: 'WAITING_FOR_DEPOSIT',
};

function getTotalCancelAmount(cancels: Cancel[] | null): number {
    if (!cancels) return 0;
    return cancels.reduce((sum, c) => sum + c.cancelAmount, 0);
}

function getLastCanceledAt(cancels: Cancel[] | null): Date | null {
    if (!cancels || cancels.length === 0) return null;
    return new Date(cancels[cancels.length - 1].canceledAt);
}

export async function syncTossPayments(courseId: string) {
    try {
        if (!courseId) {
            return {
                success: false,
                error: 'courseId is required',
            };
        }

        // 특정 강의 결제만 조회
        const payments = await db.tossCustomer.findMany({
            where: { courseId },
            select: {
                id: true,
                orderId: true,
                paymentKey: true,
                paymentStatus: true,
                finalPrice: true,
                cancelAmount: true,
                refundableAmount: true,
                canceledAt: true,
            },
        });

        const updated: any[] = [];

        for (const p of payments) {
            if (!p.paymentKey) continue;
            if (p.orderId.startsWith('FREE-')) continue; // 무료 강의 제외(토스에 없음)

            const res = await fetch(
                `https://api.tosspayments.com/v1/payments/${encodeURIComponent(p.paymentKey)}`,
                {
                    method: 'GET',
                    headers: { Authorization: getEncryptedSecretKey() },
                    cache: 'no-store', // Server Action에서 캐싱 방지
                }
            );

            if (!res.ok) continue;

            const toss: TossPayment = await res.json();
            const newStatus = mapStatus[toss.status] || toss.status;

            const newFinalPrice = toss.totalAmount;
            const newRefundableAmount = toss.balanceAmount ?? null;
            const newCancelAmount = getTotalCancelAmount(toss.cancels ?? []);
            const newCanceledAt = getLastCanceledAt(toss.cancels ?? []);

            const needUpdate =
                p.paymentStatus !== newStatus ||
                p.finalPrice !== newFinalPrice ||
                p.refundableAmount !== newRefundableAmount ||
                p.cancelAmount !== newCancelAmount ||
                (p.canceledAt?.toISOString() ?? null) !== (newCanceledAt?.toISOString() ?? null);

            if (!needUpdate) continue;

            await db.tossCustomer.update({
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

        return {
            success: true,
            updatedCount: updated.length,
            updated,
        };
    } catch (err) {
        console.error('[SYNC_TOSS_PAYMENTS_ERROR]', err);
        return {
            success: false,
            error: err instanceof Error ? err.message : String(err),
        };
    } finally {
        await db.$disconnect();
    }
}
