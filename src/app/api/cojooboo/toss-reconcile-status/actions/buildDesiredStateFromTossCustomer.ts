import type { Prisma, TossCustomer, Order, Payment } from '@/generated/cojooboo';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@/generated/cojooboo';

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

function toPaymentMethod(v: unknown): PaymentMethod | null {
    const m = upper(v);
    if (m === 'CARD') return PaymentMethod.CARD;
    if (m === 'TRANSFER') return PaymentMethod.TRANSFER;
    if (m === 'VIRTUAL_ACCOUNT') return PaymentMethod.VIRTUAL_ACCOUNT;
    if (m === 'DIRECT_DEPOSIT') return PaymentMethod.DIRECT_DEPOSIT;
    if (m === 'EASY_PAY') return PaymentMethod.EASY_PAY;
    return null;
}

export function buildDesiredStateFromTossCustomer(
    tc: TossCustomer,
    order: Order,
    payment: Payment
): DesiredState {
    const orderPatch: Prisma.OrderUpdateInput = {};
    const paymentPatch: Prisma.PaymentUpdateInput = {};

    // ---- 메타 동기화(값이 다를 때만) ----
    if (payment.tossPaymentKey !== tc.paymentKey) paymentPatch.tossPaymentKey = tc.paymentKey;

    const pm = toPaymentMethod(tc.paymentMethod);
    if (pm && payment.paymentMethod !== pm) paymentPatch.paymentMethod = pm;

    if (payment.isTaxFree !== tc.isTaxFree) paymentPatch.isTaxFree = tc.isTaxFree;

    if ((payment.cancelAmount ?? null) !== (tc.cancelAmount ?? null))
        paymentPatch.cancelAmount = tc.cancelAmount;
    if ((payment.refundableAmount ?? null) !== (tc.refundableAmount ?? null))
        paymentPatch.refundableAmount = tc.refundableAmount;

    if ((payment.canceledAt ?? null) !== (tc.canceledAt ?? null))
        paymentPatch.canceledAt = tc.canceledAt;
    if ((payment.receiptUrl ?? null) !== (tc.receiptUrl ?? null))
        paymentPatch.receiptUrl = tc.receiptUrl;

    if ((payment.mId ?? null) !== (tc.mId ?? null)) paymentPatch.mId = tc.mId;
    if ((payment.tossSecretKey ?? null) !== (tc.tossSecretKey ?? null))
        paymentPatch.tossSecretKey = tc.tossSecretKey;

    // ---- 상태 매핑 ----
    const status = upper(tc.paymentStatus);
    const cancelAmount = tc.cancelAmount ?? 0;
    const finalPrice = tc.finalPrice;
    const hasCancel = Boolean(tc.canceledAt) || cancelAmount > 0;

    // ✅ REFUNDED를 최우선으로 명시 처리
    if (status === 'REFUNDED') {
        if (payment.paymentStatus !== PaymentStatus.CANCELED)
            paymentPatch.paymentStatus = PaymentStatus.CANCELED;
        if (order.status !== OrderStatus.REFUNDED) orderPatch.status = OrderStatus.REFUNDED;
    } else if (
        status === 'COMPLETED' ||
        status === 'DONE' ||
        status === 'PAID' ||
        status === 'SUCCESS'
    ) {
        if (!hasCancel) {
            if (payment.paymentStatus !== PaymentStatus.DONE)
                paymentPatch.paymentStatus = PaymentStatus.DONE;
            if (order.status !== OrderStatus.PAID) orderPatch.status = OrderStatus.PAID;
        } else {
            // COMPLETED인데 cancelAmount/canceledAt이 있으면 취소/부분취소로 본다
            if (cancelAmount >= finalPrice || Boolean(tc.canceledAt)) {
                if (payment.paymentStatus !== PaymentStatus.CANCELED)
                    paymentPatch.paymentStatus = PaymentStatus.CANCELED;
                if (order.status !== OrderStatus.REFUNDED) orderPatch.status = OrderStatus.REFUNDED;
            } else {
                if (payment.paymentStatus !== PaymentStatus.PARTIAL_CANCELED)
                    paymentPatch.paymentStatus = PaymentStatus.PARTIAL_CANCELED;
                if (order.status !== OrderStatus.PARTIAL_REFUNDED)
                    orderPatch.status = OrderStatus.PARTIAL_REFUNDED;
            }
        }
    } else if (status === 'FAILED') {
        if (payment.paymentStatus !== PaymentStatus.FAILED)
            paymentPatch.paymentStatus = PaymentStatus.FAILED;
        if (order.status !== OrderStatus.FAILED) orderPatch.status = OrderStatus.FAILED;
    } else if (status === 'WAITING_FOR_DEPOSIT') {
        if (payment.paymentStatus !== PaymentStatus.WAITING_FOR_DEPOSIT)
            paymentPatch.paymentStatus = PaymentStatus.WAITING_FOR_DEPOSIT;
        if (order.status !== OrderStatus.PENDING) orderPatch.status = OrderStatus.PENDING;
    } else if (status === 'READY') {
        if (payment.paymentStatus !== PaymentStatus.READY)
            paymentPatch.paymentStatus = PaymentStatus.READY;
        if (order.status !== OrderStatus.PENDING) orderPatch.status = OrderStatus.PENDING;
    } else if (status === 'CANCELED' || status === 'CANCELLED') {
        if (payment.paymentStatus !== PaymentStatus.CANCELED)
            paymentPatch.paymentStatus = PaymentStatus.CANCELED;
        if (order.status !== OrderStatus.CANCELED) orderPatch.status = OrderStatus.CANCELED;
    } else if (hasCancel) {
        // 상태 문자열이 뭐든 cancel 정보가 있으면 환불/부분환불로 맞춤
        if (cancelAmount >= finalPrice || Boolean(tc.canceledAt)) {
            if (payment.paymentStatus !== PaymentStatus.CANCELED)
                paymentPatch.paymentStatus = PaymentStatus.CANCELED;
            if (order.status !== OrderStatus.REFUNDED) orderPatch.status = OrderStatus.REFUNDED;
        } else {
            if (payment.paymentStatus !== PaymentStatus.PARTIAL_CANCELED)
                paymentPatch.paymentStatus = PaymentStatus.PARTIAL_CANCELED;
            if (order.status !== OrderStatus.PARTIAL_REFUNDED)
                orderPatch.status = OrderStatus.PARTIAL_REFUNDED;
        }
    } else {
        // 알 수 없는 상태면 상태는 건드리지 않음
    }

    const shouldUpdate = Object.keys(orderPatch).length > 0 || Object.keys(paymentPatch).length > 0;

    return shouldUpdate
        ? { shouldUpdate: true, orderPatch, paymentPatch }
        : { shouldUpdate: false, reason: 'No changes', orderPatch: {}, paymentPatch: {} };
}
