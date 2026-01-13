'use server';

import { ivyDb } from '@/lib/ivyDb';
import { refundPayment } from '@/external-api/tosspayments/services/refund-payment';
import { revalidateTag } from 'next/cache';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@/generated/ivy';
import { getIsAdmin } from '@/lib/is-admin';

type RefundPaymentActionInput = {
    tossCustomerId: string;
    cancelReason: string;
    cancelAmount?: number | null;
    isDeleteEnrollment?: boolean;
    bankCode?: string;
    accountNumber?: string;
    accountHolder?: string;
};

type RefundPaymentActionResult =
    | {
          success: true;
          message: string;
          paymentId: string;
          orderId: string;
          canceledAmount: number;
          refundableAmount: number;
      }
    | { success: false; message: string };

type TossCancel = {
    cancelAmount?: number;
    refundableAmount?: number;
    canceledAt?: string;
    cancelReason?: string;
};

function safeNumber(v: unknown): number {
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : 0;
}

function toDate(v: unknown): Date | null {
    if (!v) return null;
    const d = v instanceof Date ? v : new Date(String(v));
    return Number.isNaN(d.getTime()) ? null : d;
}

export async function refundPaymentAction(
    input: RefundPaymentActionInput
): Promise<RefundPaymentActionResult> {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return { success: false, message: 'Unauthorized' };

        const {
            tossCustomerId,
            cancelReason,
            cancelAmount,
            isDeleteEnrollment = false,
            bankCode,
            accountNumber,
            accountHolder,
        } = input;

        const tc = await ivyDb.tossCustomer.findUnique({
            where: { id: tossCustomerId },
            select: {
                id: true,
                orderId: true,
                paymentKey: true,
                paymentStatus: true,
                finalPrice: true,
                refundableAmount: true,
                userId: true,
                courseId: true,
            },
        });

        if (!tc) return { success: false, message: '환불 대상을 찾을 수 없습니다. (tossCustomer)' };
        if (!tc.paymentKey)
            return { success: false, message: 'Toss PaymentKey가 존재하지 않습니다.' };

        const approvedAmount = safeNumber(tc.finalPrice);
        if (approvedAmount <= 0)
            return { success: false, message: '무료 결제건은 환불이 불가능합니다.' };

        const paymentWithOrder = await ivyDb.payment.findFirst({
            where: { tossPaymentKey: tc.paymentKey },
            include: { order: true },
        });

        if (!paymentWithOrder) {
            return { success: false, message: '내부 결제 기록(Payment)을 찾을 수 없습니다.' };
        }

        const paymentId = paymentWithOrder.id;
        const orderId = paymentWithOrder.orderId;

        const method = paymentWithOrder.paymentMethod;
        const isVirtualAccount = method === String(PaymentMethod.VIRTUAL_ACCOUNT);
        const isWaitingForDeposit =
            String(tc.paymentStatus ?? '').toUpperCase() === 'WAITING_FOR_DEPOSIT';

        const tossRefundResult = await refundPayment({
            paymentKey: tc.paymentKey,
            cancelReason,
            cancelAmount: cancelAmount ?? null,
            isVirtualAccount: isVirtualAccount && !isWaitingForDeposit,
            ...(isVirtualAccount &&
                !isWaitingForDeposit && {
                    bankCode,
                    accountNumber,
                    accountHolder,
                }),
        });

        if (!tossRefundResult.success) {
            return {
                success: false,
                message: tossRefundResult.message ?? '토스 API 환불 처리 실패',
            };
        }

        const cancels = (tossRefundResult.data?.cancels ?? []) as TossCancel[];
        if (!Array.isArray(cancels) || cancels.length === 0) {
            return { success: false, message: '환불 결과 데이터를 찾을 수 없습니다.' };
        }

        const last = cancels[cancels.length - 1];
        const refundableAmount = safeNumber(last.refundableAmount);
        const canceledSoFar = Math.max(0, approvedAmount - refundableAmount);

        const nextPaymentStatus =
            refundableAmount > 0 ? PaymentStatus.PARTIAL_CANCELED : PaymentStatus.CANCELED;
        const nextOrderStatus =
            refundableAmount > 0 ? OrderStatus.PARTIAL_REFUNDED : OrderStatus.REFUNDED;
        const canceledAt = toDate(last.canceledAt) ?? new Date();

        await ivyDb.$transaction(async (tx) => {
            await tx.payment.update({
                where: { id: paymentId },
                data: {
                    paymentStatus: nextPaymentStatus as PaymentStatus,
                    cancelAmount: canceledSoFar,
                    canceledAt,
                    cancelReason: cancelReason ?? last.cancelReason ?? null,
                },
            });

            await tx.order.update({
                where: { id: orderId },
                data: {
                    status: nextOrderStatus as OrderStatus,
                },
            });

            await tx.tossCustomer.update({
                where: { id: tc.id },
                data: {
                    paymentStatus: refundableAmount > 0 ? 'PARTIAL_REFUNDED' : 'REFUNDED',
                    cancelAmount: canceledSoFar,
                    cancelReason,
                    refundableAmount,
                    canceledAt,
                },
            });

            if (isDeleteEnrollment && tc.userId && tc.courseId) {
                const course = await tx.course.findUnique({
                    where: { id: tc.courseId },
                    select: { id: true, parentId: true },
                });

                const targetCourseIds: string[] = [];
                if (course?.parentId) targetCourseIds.push(course.parentId);
                if (course?.id) targetCourseIds.push(course.id);

                if (targetCourseIds.length > 0) {
                    await tx.enrollment.deleteMany({
                        where: {
                            userId: tc.userId,
                            courseId: { in: targetCourseIds },
                        },
                    });
                    for (const cid of targetCourseIds) revalidateTag(`course-${cid}`);
                }
            } else if (tc.courseId) {
                revalidateTag(`course-${tc.courseId}`);
            }
        });

        return {
            success: true,
            message: '환불 처리가 완료되었습니다.',
            paymentId,
            orderId,
            canceledAmount: canceledSoFar,
            refundableAmount,
        };
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('[REFUND_PAYMENT_ACTION_ERROR]', e);
        return { success: false, message: msg };
    }
}
