'use server';

export async function buildDesiredStateFromTossCustomer(tc: any, order: any, payment: any) {
    const orderPatch: any = {};
    const paymentPatch: any = {};
    let shouldUpdate = false;

    let targetOrder = order.status;
    let targetPayment = payment.paymentStatus;

    if (tc.paymentStatus === 'CANCELED' || tc.paymentStatus === 'REFUNDED') {
        targetOrder = 'CANCELED';
        targetPayment = 'CANCELED';
    }

    if (order.status !== targetOrder) {
        orderPatch.status = targetOrder;
        shouldUpdate = true;
    }
    if (payment.paymentStatus !== targetPayment) {
        paymentPatch.paymentStatus = targetPayment;
        shouldUpdate = true;
    }

    if (Number(payment.cancelAmount || 0) !== Number(tc.cancelAmount || 0)) {
        paymentPatch.cancelAmount = tc.cancelAmount;
        shouldUpdate = true;
    }

    return { shouldUpdate, orderPatch, paymentPatch };
}
