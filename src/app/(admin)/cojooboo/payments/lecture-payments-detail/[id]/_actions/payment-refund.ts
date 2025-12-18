'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import { refundPayment } from '@/external-api/tosspayments/services/refund-payment';

import { revalidateTag } from 'next/cache';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@/generated/cojooboo';
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

        // 1) TossCustomer 조회
        const tc = await cojoobooDb.tossCustomer.findUnique({
            where: { id: tossCustomerId },
            select: {
                id: true,
                orderId: true,
                paymentKey: true,
                paymentStatus: true,
                finalPrice: true,
                refundableAmount: true,
                paymentMethod: true,
                userId: true,
                courseId: true,
                // 아래 필드들이 실제 스키마에 없으면 제거해도 됨
                // productType: true,
            },
        });

        if (!tc) return { success: false, message: 'Payment not found (tossCustomer)' };
        if (!tc.paymentKey) return { success: false, message: 'toss paymentKey가 없습니다.' };

        const approvedAmount = safeNumber(tc.finalPrice);
        if (approvedAmount <= 0)
            return { success: false, message: '무료 결제는 환불이 불가능합니다.' };

        // 2) Payment + Order 조회 (tossPaymentKey로 Payment 찾는게 제일 안전)
        const paymentWithOrder = await cojoobooDb.payment.findUnique({
            where: { tossPaymentKey: tc.paymentKey },
            include: {
                order: true,
            },
        });

        if (!paymentWithOrder)
            return { success: false, message: 'Payment row를 찾을 수 없습니다.' };
        if (!paymentWithOrder.order)
            return { success: false, message: 'Order row를 찾을 수 없습니다.' };

        const paymentId = paymentWithOrder.id;
        const orderId = paymentWithOrder.order.id;

        // 3) 토스 환불 호출
        const method = String(tc.paymentMethod ?? '').toUpperCase();
        const isVirtualAccount = method === String(PaymentMethod.VIRTUAL_ACCOUNT);

        // WAITING_FOR_DEPOSIT(입금대기)인 가상계좌는 환불 파라미터가 다를 수 있어서 기존 로직 유지
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
            return { success: false, message: tossRefundResult.message ?? '토스 환불 실패' };
        }

        const cancels = (tossRefundResult.data?.cancels ?? []) as TossCancel[];
        if (!Array.isArray(cancels) || cancels.length === 0) {
            return { success: false, message: '환불 정보를 찾을 수 없습니다. (cancels empty)' };
        }

        const last = cancels[cancels.length - 1];
        const refundableAmount = safeNumber(last.refundableAmount);

        // ✅ “총 환불된 금액”을 확실히 만들기: 승인액 - 남은 환불가능액
        // (이 값이 DB에 들어가야 통계에서 cancelAmount 집계가 됨)
        const canceledSoFar = Math.max(0, approvedAmount - refundableAmount);

        const nextPaymentStatus =
            refundableAmount > 0 ? PaymentStatus.PARTIAL_CANCELED : PaymentStatus.CANCELED;
        const nextOrderStatus =
            refundableAmount > 0 ? OrderStatus.PARTIAL_REFUNDED : OrderStatus.REFUNDED;

        const canceledAt = toDate(last.canceledAt) ?? new Date();

        // 4) DB 반영 (Payment / Order / TossCustomer)
        await cojoobooDb.$transaction(async (tx) => {
            await tx.payment.update({
                where: { id: paymentId },
                data: {
                    paymentStatus: nextPaymentStatus,
                    cancelAmount: canceledSoFar, // ✅ 핵심: null이면 집계 안됨 → 반드시 숫자로
                    canceledAt,
                    cancelReason: cancelReason ?? last.cancelReason ?? null,
                },
            });

            await tx.order.update({
                where: { id: orderId },
                data: {
                    status: nextOrderStatus,
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

            // 5) (옵션) 수강권 삭제
            // ✅ 결제 내역이 child course(= parentId 보유)라면 parentId + courseId 둘 다 enrollment 삭제
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

                    // 캐시 태그도 같이 갱신
                    for (const cid of targetCourseIds) revalidateTag(`course-${cid}`);
                }
            } else if (tc.courseId) {
                // 수강권 삭제는 안해도, 결제/환불 반영됐으니 최소 해당 코스는 갱신
                revalidateTag(`course-${tc.courseId}`);
            }
        });

        return {
            success: true,
            message: '환불 처리 완료',
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
