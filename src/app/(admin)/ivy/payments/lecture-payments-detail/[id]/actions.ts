'use server';

import { ivyDb } from '@/lib/ivyDb';
import {
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
    Prisma,
    ProductCategory,
} from '@/generated/ivy';
import { revalidatePath } from 'next/cache';

export type LecturePaymentDetailRow = {
    paidAt: Date;
    orderId: string;
    orderNumber: string;
    orderStatus: OrderStatus;
    paymentId: string;
    tossPaymentKey: string | null;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    userId: string | null;
    buyerName: string | null;
    buyerEmail: string | null;
    buyerPhone: string | null;
    courseId: string;
    courseTitle: string;
    itemPrice: number;
    paidAmount: number;
    refundAmount: number;
    netAmount: number;
    receiptUrl: string | null;
    tossCustomerId: string | null;
    refundableAmount: number | null;
};

export type GetLecturePaymentsParams = {
    courseId: string;
    status?: string;
    type?: string;
    search?: string;
};

const PAYMENT_STATUS_SET = new Set<string>(Object.values(PaymentStatus));
const ORDER_STATUS_SET = new Set<string>(Object.values(OrderStatus));
const PAYMENT_METHOD_SET = new Set<string>(Object.values(PaymentMethod));

function uniq(arr: string[]): string[] {
    return Array.from(new Set(arr));
}

/** ✅ 1원 단위 오차 방지 배분 함수 */
function allocateMoney(
    total: number,
    items: { key: string; price: number }[]
): Map<string, number> {
    const result = new Map<string, number>();
    const totalPrice = items.reduce((sum, it) => sum + it.price, 0);

    if (totalPrice <= 0 || total === 0) {
        items.forEach((it) => result.set(it.key, 0));
        return result;
    }

    let remaining = total;
    items.forEach((it, idx) => {
        if (idx === items.length - 1) {
            result.set(it.key, remaining);
        } else {
            const share = Math.round((total * it.price) / totalPrice);
            result.set(it.key, share);
            remaining -= share;
        }
    });
    return result;
}

/** -------------------------------
 * 🔥 강의별 결제 내역 조회
 -------------------------------- */
export async function getLecturePaymentsByOrder(
    params: GetLecturePaymentsParams
): Promise<{ rows: LecturePaymentDetailRow[] }> {
    const { courseId, status, type, search } = params;

    const childCourses = await ivyDb.course.findMany({
        where: { parentId: courseId },
        select: { id: true },
    });

    const targetCourseIds = uniq([courseId, ...childCourses.map((c) => c.id)]);
    const targetSet = new Set(targetCourseIds);

    const itemWhere: Prisma.OrderItemWhereInput = {
        productCategory: 'COURSE',
        OR: [{ courseId: { in: targetCourseIds } }, { productId: { in: targetCourseIds } }],
    };

    const statusUpper = (status ?? '').toUpperCase();
    const paymentStatusFilter = PAYMENT_STATUS_SET.has(statusUpper)
        ? (statusUpper as PaymentStatus)
        : undefined;
    const orderStatusFilter = ORDER_STATUS_SET.has(statusUpper)
        ? (statusUpper as OrderStatus)
        : undefined;
    const methodUpper = (type ?? '').toUpperCase();
    const paymentMethodFilter = PAYMENT_METHOD_SET.has(methodUpper)
        ? (methodUpper as PaymentMethod)
        : undefined;
    const q = (search ?? '').trim();

    const where: Prisma.PaymentWhereInput = {
        ...(paymentStatusFilter ? { paymentStatus: paymentStatusFilter } : {}),
        ...(paymentMethodFilter ? { paymentMethod: paymentMethodFilter } : {}),
        order: {
            ...(orderStatusFilter ? { status: orderStatusFilter } : {}),
            orderItems: { some: itemWhere },
            ...(q
                ? {
                      OR: [
                          { orderNumber: { contains: q, mode: 'insensitive' } },
                          { orderName: { contains: q, mode: 'insensitive' } },
                          { user: { nickname: { contains: q, mode: 'insensitive' } } },
                          { user: { username: { contains: q, mode: 'insensitive' } } },
                          { user: { email: { contains: q, mode: 'insensitive' } } },
                          { user: { phone: { contains: q, mode: 'insensitive' } } },
                      ],
                  }
                : {}),
        },
    };

    const payments = await ivyDb.payment.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: {
            id: true,
            createdAt: true,
            tossPaymentKey: true,
            paymentMethod: true,
            paymentStatus: true,
            amount: true,
            cancelAmount: true,
            receiptUrl: true,
            order: {
                select: {
                    id: true,
                    orderNumber: true,
                    status: true,
                    user: {
                        select: {
                            id: true,
                            nickname: true,
                            username: true,
                            email: true,
                            phone: true,
                        },
                    },
                    orderItems: {
                        select: {
                            courseId: true,
                            productId: true,
                            productTitle: true,
                            originalPrice: true,
                            discountedPrice: true,
                        },
                    },
                },
            },
        },
    });

    const paymentKeys = payments.map((p) => p.tossPaymentKey).filter((k): k is string => !!k);
    const tossCustomers = paymentKeys.length
        ? await ivyDb.tossCustomer.findMany({
              where: { paymentKey: { in: paymentKeys } },
              select: { id: true, paymentKey: true, refundableAmount: true },
          })
        : [];
    const tcMap = new Map(tossCustomers.map((tc) => [tc.paymentKey, tc]));

    const rows: LecturePaymentDetailRow[] = payments.map((p) => {
        const allItems = p.order.orderItems.map((it) => ({
            key: (it.courseId ?? it.productId) || 'unknown',
            price: it.discountedPrice ?? it.originalPrice ?? 0,
            title: it.productTitle,
        }));

        const originalGross = p.amount + (p.cancelAmount ?? 0);
        const actualRefund = p.cancelAmount ?? 0;

        const paidAlloc = allocateMoney(originalGross, allItems);
        const refundAlloc = allocateMoney(actualRefund, allItems);

        let allocatedPaid = 0;
        let allocatedRefund = 0;
        let representativeTitle = '';

        for (const item of allItems) {
            if (targetSet.has(item.key)) {
                allocatedPaid += paidAlloc.get(item.key) ?? 0;
                allocatedRefund += refundAlloc.get(item.key) ?? 0;
                if (!representativeTitle) representativeTitle = item.title;
            }
        }

        const tc = p.tossPaymentKey ? tcMap.get(p.tossPaymentKey) : undefined;

        return {
            paidAt: p.createdAt,
            receiptUrl: p.receiptUrl,
            orderId: p.order.id,
            orderNumber: p.order.orderNumber,
            orderStatus: p.order.status,
            paymentId: p.id,
            tossPaymentKey: p.tossPaymentKey,
            paymentMethod: p.paymentMethod,
            paymentStatus: p.paymentStatus,
            userId: p.order.user?.id ?? null,
            buyerName: p.order.user?.username ?? null,
            buyerEmail: p.order.user?.email ?? null,
            buyerPhone: p.order.user?.phone ?? null,
            courseId: courseId,
            courseTitle: representativeTitle || '(알 수 없음)',
            itemPrice: allocatedPaid,
            paidAmount: allocatedPaid,
            refundAmount: allocatedRefund,
            netAmount: allocatedPaid - allocatedRefund,
            tossCustomerId: tc?.id ?? null,
            refundableAmount: tc?.refundableAmount ?? null,
        };
    });

    return { rows };
}

/** -------------------------------
 * 🔥 현금결제 업로드 (에러 수정 완료)
 -------------------------------- */
export async function uploadCashPaymentsAction(courseId: string, rowData: any[]) {
    try {
        const course = await ivyDb.course.findFirst({
            where: { id: courseId },
            select: { title: true },
        });

        const results = await ivyDb.$transaction(async (tx) => {
            let successCount = 0;

            for (const row of rowData) {
                let rawPhone = String(row['핸드폰번호'] || '')
                    .replace(/-/g, '')
                    .trim();
                if (
                    rawPhone.startsWith('10') &&
                    (rawPhone.length === 9 || rawPhone.length === 10)
                ) {
                    rawPhone = '0' + rawPhone;
                }
                const phone = rawPhone;
                const originalAmount = Number(row['결제금'] || 0);
                const refundAmount = Number(row['환불액'] || 0);

                // ✅ [핵심 수정] 실 결제 잔액 계산 (2,790,000 - 2,790,000 = 0원)
                const netAmount = originalAmount - refundAmount;

                const parseDate = (val: any) => {
                    if (!val) return new Date();
                    if (typeof val === 'number') return new Date((val - 25569) * 86400 * 1000);
                    if (val instanceof Date) return val;
                    const d = new Date(String(val).replace(/\./g, '-').trim());
                    return isNaN(d.getTime()) ? new Date() : d;
                };

                const paidAt = parseDate(row['결제일']);
                const refundedAt = row['환불일'] ? parseDate(row['환불일']) : null;

                if (!phone || originalAmount <= 0) continue;

                const user = await tx.user.findFirst({ where: { phone } });
                if (!user) continue;

                const isFullRefund = refundAmount > 0 && refundAmount >= originalAmount;
                const isPartialRefund = refundAmount > 0 && refundAmount < originalAmount;

                const orderStatus = isFullRefund
                    ? OrderStatus.REFUNDED
                    : isPartialRefund
                      ? OrderStatus.PARTIAL_REFUNDED
                      : OrderStatus.PAID;
                const paymentStatus = isFullRefund
                    ? PaymentStatus.CANCELED
                    : isPartialRefund
                      ? PaymentStatus.PARTIAL_CANCELED
                      : PaymentStatus.DONE;

                const dayStart = new Date(paidAt);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(paidAt);
                dayEnd.setHours(23, 59, 59, 999);

                const existingOrder = await tx.order.findFirst({
                    where: {
                        userId: user.id,
                        orderItems: { some: { courseId } },
                        amount: originalAmount,
                        createdAt: { gte: dayStart, lt: dayEnd },
                    },
                    include: { payments: true },
                });

                if (existingOrder) {
                    await tx.order.update({
                        where: { id: existingOrder.id },
                        data: { status: orderStatus, updatedAt: new Date() },
                    });
                    if (existingOrder.payments.length > 0) {
                        await tx.payment.update({
                            where: { id: existingOrder.payments[0].id },
                            data: {
                                amount: netAmount, // ✅ 남은 금액으로 업데이트
                                cancelAmount: refundAmount,
                                canceledAt: refundedAt,
                                paymentStatus: paymentStatus,
                                updatedAt: new Date(),
                            },
                        });
                    }
                } else {
                    const orderNumber = `CASH-${Date.now().toString().slice(-6)}`;
                    await tx.order.create({
                        data: {
                            orderName: `${course?.title || '강의 결제'}`,
                            orderNumber,
                            status: orderStatus,
                            amount: originalAmount,
                            paidAmount: originalAmount,
                            remainingAmount: 0, // ✅ [해결] 필수 필드 추가
                            originalPrice: originalAmount, // ✅ [해결] 필수 필드 추가
                            userId: user.id,
                            createdAt: paidAt,
                            orderItems: {
                                create: {
                                    productId: courseId,
                                    productTitle: course?.title || '현금 결제 상품',
                                    productCategory: ProductCategory.COURSE,
                                    courseId,
                                    quantity: 1,
                                    originalPrice: originalAmount,
                                    createdAt: paidAt,
                                },
                            },
                            payments: {
                                create: {
                                    amount: netAmount, // ✅ 동기화 시점에 '남은 금액' 저장
                                    paymentMethod: PaymentMethod.TRANSFER,
                                    paymentStatus: paymentStatus,
                                    cancelAmount: refundAmount,
                                    canceledAt: refundedAt,
                                    fee: 0,
                                    createdAt: paidAt,
                                },
                            },
                        },
                    });
                }
                successCount++;
            }
            return successCount;
        });

        revalidatePath('/ivy/payments/lecture-payments');
        return { success: true, count: results };
    } catch (error) {
        console.error('SYNC_ERROR', error);
        return { success: false, message: '데이터 처리 중 서버 오류가 발생했습니다.' };
    }
}

/** -------------------------------
 * 🔥 현금결제 수동 환불 액션
 -------------------------------- */
export async function manualRefundAction(data: {
    paymentId: string;
    orderId: string;
    userId: string;
    courseId: string;
    cancelReason?: string;
    cancelAmount?: number;
    keepEnrollment: boolean;
}) {
    const { paymentId, orderId, userId, courseId, cancelReason, cancelAmount, keepEnrollment } =
        data;
    try {
        await ivyDb.$transaction(async (tx) => {
            const payment = await tx.payment.findUnique({ where: { id: paymentId } });
            if (!payment) throw new Error('결제 내역 없음');

            const finalCancelAmount = cancelAmount ?? payment.amount - (payment.cancelAmount ?? 0);
            const isPartial = finalCancelAmount < payment.amount;

            await tx.payment.update({
                where: { id: paymentId },
                data: {
                    paymentStatus: isPartial
                        ? PaymentStatus.PARTIAL_CANCELED
                        : PaymentStatus.CANCELED,
                    cancelAmount: finalCancelAmount,
                    cancelReason: cancelReason || '단순 변심',
                    canceledAt: new Date(),
                },
            });

            await tx.order.update({
                where: { id: orderId },
                data: { status: isPartial ? OrderStatus.PARTIAL_REFUNDED : OrderStatus.REFUNDED },
            });

            if (!keepEnrollment && userId && courseId) {
                await tx.enrollment.deleteMany({ where: { userId, courseId } });
            }
        });
        revalidatePath('/ivy/payments/lecture-payments');
        return { success: true };
    } catch (error) {
        return { success: false, message: '환불 실패' };
    }
}

/** -------------------------------
 * 🔥 결제 이력 조회
 -------------------------------- */
export async function getPaymentLogAction(orderId: string) {
    try {
        const order = await ivyDb.order.findUnique({
            where: { id: orderId },
            include: {
                payments: { orderBy: { createdAt: 'asc' } },
                user: { select: { username: true, email: true, phone: true } },
            },
        });
        if (!order) throw new Error('주문 없음');
        return { success: true, data: order };
    } catch (error) {
        return { success: false, message: '조회 실패' };
    }
}
