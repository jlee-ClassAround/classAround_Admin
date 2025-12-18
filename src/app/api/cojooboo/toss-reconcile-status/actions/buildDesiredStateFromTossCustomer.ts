import type { Prisma } from '@/generated/cojooboo';
import { OrderStatus, PaymentStatus } from '@/generated/cojooboo';

type TossCustomerLike = {
    id: string;
    // 너 프로젝트 TossCustomer에 있는 필드들 중 “있는 것만” 쓰면 됨
    paymentKey?: string | null;
    paymentStatus?: string | null; // 또는 status
    status?: string | null;

    amount?: number | null;

    // ✅ 여기 중요: 너 TossCustomer에 실제로 저장돼있는 환불 관련 필드명에 맞춰서 1개 이상 살아있게 하면 됨
    cancelAmount?: number | null;
    canceledAt?: string | Date | null;
    cancelReason?: string | null;
};

type DesiredState = {
    shouldUpdate: boolean;
    reason?: string;
    orderPatch: Prisma.OrderUpdateInput;
    paymentPatch: Prisma.PaymentUpdateInput;
};

function upper(v: unknown): string {
    return String(v ?? '')
        .trim()
        .toUpperCase();
}

function toDate(v: unknown): Date | undefined {
    if (!v) return undefined;
    const d = v instanceof Date ? v : new Date(String(v));
    return Number.isNaN(d.getTime()) ? undefined : d;
}

function n(v: unknown): number | undefined {
    const num = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(num) ? num : undefined;
}

export function buildDesiredStateFromTossCustomer(
    tc: TossCustomerLike,
    order: { status: OrderStatus },
    payment: {
        paymentStatus: PaymentStatus;
        amount: number;
        cancelAmount: number | null;
        canceledAt: Date | null;
        cancelReason: string | null;
    }
): DesiredState {
    const orderPatch: Prisma.OrderUpdateInput = {};
    const paymentPatch: Prisma.PaymentUpdateInput = {};

    const tcStatus = upper(tc.paymentStatus ?? tc.status);

    // ----------------------------
    // 1) 상태 보정 (기존 너 로직이 있으면 여기를 거기에 맞춰 커스터마이즈)
    // ----------------------------
    let nextPaymentStatus: PaymentStatus | undefined;
    let nextOrderStatus: OrderStatus | undefined;

    if (tcStatus === 'DONE' || tcStatus === 'PAID' || tcStatus === 'COMPLETED') {
        nextPaymentStatus = PaymentStatus.DONE;
        // 주문 상태는 너 프로젝트 정의에 맞춰(예: PAID)
        nextOrderStatus = OrderStatus.PAID;
    } else if (tcStatus === 'CANCELED' || tcStatus === 'CANCELLED') {
        nextPaymentStatus = PaymentStatus.CANCELED;
        nextOrderStatus = OrderStatus.REFUNDED;
    } else if (tcStatus === 'PARTIAL_CANCELED' || tcStatus === 'PARTIAL_CANCELLED') {
        nextPaymentStatus = PaymentStatus.PARTIAL_CANCELED;
        nextOrderStatus = OrderStatus.PARTIAL_REFUNDED;
    }

    if (nextPaymentStatus && payment.paymentStatus !== nextPaymentStatus) {
        paymentPatch.paymentStatus = nextPaymentStatus;
    }
    if (nextOrderStatus && order.status !== nextOrderStatus) {
        orderPatch.status = nextOrderStatus;
    }

    // ----------------------------
    // 2) ✅ 환불 금액/시간/사유 보정 (핵심)
    // ----------------------------
    const isCanceled =
        nextPaymentStatus === PaymentStatus.CANCELED ||
        nextPaymentStatus === PaymentStatus.PARTIAL_CANCELED ||
        paymentPatch.paymentStatus === PaymentStatus.CANCELED ||
        paymentPatch.paymentStatus === PaymentStatus.PARTIAL_CANCELED ||
        payment.paymentStatus === PaymentStatus.CANCELED ||
        payment.paymentStatus === PaymentStatus.PARTIAL_CANCELED;

    if (isCanceled) {
        // tc에서 환불 금액을 가져올 수 있으면 그걸 우선 사용
        const tcCancelAmount = n(tc.cancelAmount);

        // ✅ full cancel인데 tc에 cancelAmount가 없다면 “승인금액=환불금액”으로 백필
        const fallbackCancelAmount =
            (paymentPatch.paymentStatus ?? payment.paymentStatus) === PaymentStatus.CANCELED
                ? payment.amount
                : undefined;

        const desiredCancelAmount = tcCancelAmount ?? fallbackCancelAmount;

        // cancelAmount가 null이면 통계에서 빠지니까, 여기서 최소한 0/amount라도 채워주자
        if (typeof desiredCancelAmount === 'number') {
            const current = payment.cancelAmount ?? null;
            if (current !== desiredCancelAmount) {
                paymentPatch.cancelAmount = desiredCancelAmount;
            }
        }

        const desiredCanceledAt = toDate(tc.canceledAt);
        if (desiredCanceledAt && !payment.canceledAt) {
            paymentPatch.canceledAt = desiredCanceledAt;
        }

        if (tc.cancelReason && !payment.cancelReason) {
            paymentPatch.cancelReason = tc.cancelReason;
        }
    }

    const shouldUpdate = Object.keys(orderPatch).length > 0 || Object.keys(paymentPatch).length > 0;

    return {
        shouldUpdate,
        reason: shouldUpdate ? undefined : 'No changes',
        orderPatch,
        paymentPatch,
    };
}
