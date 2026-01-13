'use server';
import { OrderStatus, PaymentStatus } from '@/generated/cojooboo';

export async function buildDesiredStateFromTossCustomer(tc: any, order: any, payment: any) {
    const orderPatch: any = {};
    const paymentPatch: any = {};
    let shouldUpdate = false;

    let targetOrder = order.status;
    let targetPayment = payment.paymentStatus;

    // ✅ 토스가 취소 상태면 우리 DB도 무조건 'CANCELED'
    if (tc.paymentStatus === 'CANCELED' || tc.paymentStatus === 'REFUNDED') {
        targetOrder = 'CANCELED'; // 목록 조회 소스의 OrderStatus 매핑
        targetPayment = 'CANCELED'; // 목록 조회 소스의 PaymentStatus 매핑
    }

    if (order.status !== targetOrder) {
        orderPatch.status = targetOrder;
        shouldUpdate = true;
    }
    if (payment.paymentStatus !== targetPayment) {
        paymentPatch.paymentStatus = targetPayment;
        shouldUpdate = true;
    }

    // ✅ 환불액 동기화
    if (Number(payment.cancelAmount || 0) !== Number(tc.cancelAmount || 0)) {
        paymentPatch.cancelAmount = tc.cancelAmount;
        shouldUpdate = true;
    }

    return { shouldUpdate, orderPatch, paymentPatch };
}
