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

function itemFinalPrice(item: { discountedPrice: number | null; originalPrice: number }): number {
    return item.discountedPrice ?? item.originalPrice;
}

function uniq(arr: string[]): string[] {
    return Array.from(new Set(arr));
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

    const itemWhere: Prisma.OrderItemWhereInput = {
        productCategory: 'COURSE',
        OR: [{ courseId: { in: targetCourseIds } }, { productId: { in: targetCourseIds } }],
    };

    const statusUpper = (status ?? '').toUpperCase();
    const paymentStatusFilter: PaymentStatus | undefined = PAYMENT_STATUS_SET.has(statusUpper)
        ? (statusUpper as PaymentStatus)
        : undefined;
    const orderStatusFilter: OrderStatus | undefined = ORDER_STATUS_SET.has(statusUpper)
        ? (statusUpper as OrderStatus)
        : undefined;

    const methodUpper = (type ?? '').toUpperCase();
    const paymentMethodFilter: PaymentMethod | undefined = PAYMENT_METHOD_SET.has(methodUpper)
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
                        where: itemWhere,
                        select: {
                            courseId: true,
                            productId: true,
                            productTitle: true,
                            originalPrice: true,
                            discountedPrice: true,
                        },
                        take: 1,
                    },
                },
            },
        },
    });

    const paymentKeys = payments
        .map((p) => p.tossPaymentKey)
        .filter((k): k is string => typeof k === 'string' && k.length > 0);

    const tossCustomers = paymentKeys.length
        ? await ivyDb.tossCustomer.findMany({
              where: { paymentKey: { in: paymentKeys } },
              select: {
                  id: true,
                  paymentKey: true,
                  refundableAmount: true,
              },
          })
        : [];

    const tcMap = new Map<string, { id: string; refundableAmount: number | null }>();
    for (const tc of tossCustomers) {
        if (tc.paymentKey) {
            tcMap.set(tc.paymentKey, { id: tc.id, refundableAmount: tc.refundableAmount });
        }
    }

    const rows: LecturePaymentDetailRow[] = payments.map((p) => {
        const oi = p.order.orderItems[0];
        const realCourseId = (oi?.courseId ?? oi?.productId ?? courseId) as string;
        const title = oi?.productTitle ?? '(알 수 없음)';
        const buyerName = p.order.user?.username ?? null;
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
            buyerName,
            buyerEmail: p.order.user?.email ?? null,
            buyerPhone: p.order.user?.phone ?? null,
            courseId: realCourseId,
            courseTitle: title,
            itemPrice: oi ? itemFinalPrice(oi) : 0,
            paidAmount: p.amount,
            refundAmount: p.cancelAmount ?? 0,
            netAmount: p.amount - (p.cancelAmount ?? 0),
            tossCustomerId: tc?.id ?? null,
            refundableAmount: tc?.refundableAmount ?? null,
        };
    });

    return { rows };
}

/** -------------------------------
 * 🔥 현금결제 XLSX 업로드 (환불 데이터 중복 허용 버전)
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
                // 1. 핸드폰 번호 보정
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

                const amount = Number(row['결제금'] || 0);
                const refundAmount = Number(row['환불액'] || 0);

                // 2. 날짜 파싱
                const parseDate = (val: any) => {
                    if (!val) return new Date();
                    if (typeof val === 'number') return new Date((val - 25569) * 86400 * 1000);
                    if (val instanceof Date) return val;
                    const cleanDate = String(val).replace(/\./g, '-').trim();
                    const d = new Date(cleanDate);
                    return isNaN(d.getTime()) ? new Date() : d;
                };

                const paidAt = parseDate(row['결제일']);
                const refundedAt = row['환불일'] ? parseDate(row['환불일']) : null;

                if (!phone || amount <= 0) continue;

                // 3. 유저 조회
                const user = await tx.user.findFirst({ where: { phone } });
                if (!user) continue;

                // 4. 중복 등록 방지 (상태 필터 추가)
                const dayStart = new Date(paidAt);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(paidAt);
                dayEnd.setHours(23, 59, 59, 999);

                const existingOrder = await tx.order.findFirst({
                    where: {
                        userId: user.id,
                        orderItems: { some: { courseId: courseId } },
                        amount: amount,
                        createdAt: { gte: dayStart, lt: dayEnd },
                        // ✅ 추가: 취소되거나 환불된 주문은 중복 체크에서 제외 (새로 등록 가능하게 함)
                        status: {
                            notIn: [OrderStatus.CANCELED, OrderStatus.REFUNDED],
                        },
                    },
                });

                if (existingOrder) continue;

                // 5. 데이터 생성
                const isFullRefund = refundAmount > 0 && refundAmount >= amount;
                const orderNumber = `CASH-${Date.now().toString().slice(-6)}`;

                await tx.order.create({
                    data: {
                        orderName: `[현금] ${course?.title || '강의 결제'}`,
                        orderNumber: orderNumber,
                        status: isFullRefund ? OrderStatus.REFUNDED : OrderStatus.PAID,
                        amount,
                        paidAmount: amount,
                        remainingAmount: 0,
                        originalPrice: amount,
                        userId: user.id,
                        createdAt: paidAt,
                        updatedAt: new Date(),
                        orderItems: {
                            create: {
                                productId: courseId,
                                productTitle: course?.title || '현금 결제 상품',
                                productCategory: ProductCategory.COURSE,
                                courseId,
                                quantity: 1,
                                originalPrice: amount,
                                createdAt: paidAt,
                                updatedAt: new Date(),
                            },
                        },
                        payments: {
                            create: {
                                amount,
                                paymentMethod: PaymentMethod.TRANSFER,
                                paymentStatus: isFullRefund
                                    ? PaymentStatus.CANCELED
                                    : PaymentStatus.DONE,
                                cancelAmount: refundAmount,
                                canceledAt: refundedAt,
                                fee: 0,
                                createdAt: paidAt,
                                updatedAt: new Date(),
                            },
                        },
                    },
                });
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
            const payment = await tx.payment.findUnique({
                where: { id: paymentId },
                select: { amount: true, cancelAmount: true },
            });

            if (!payment) throw new Error('결제 내역을 찾을 수 없습니다.');

            const finalCancelAmount = cancelAmount ?? payment.amount - (payment.cancelAmount ?? 0);
            const finalCancelReason = cancelReason?.trim() || '단순 변심';

            await tx.payment.update({
                where: { id: paymentId },
                data: {
                    paymentStatus: PaymentStatus.CANCELED,
                    cancelAmount: finalCancelAmount,
                    cancelReason: finalCancelReason,
                    canceledAt: new Date(),
                    updatedAt: new Date(),
                },
            });

            await tx.order.update({
                where: { id: orderId },
                data: { status: OrderStatus.REFUNDED, updatedAt: new Date() },
            });

            if (!keepEnrollment && userId && courseId) {
                await tx.enrollment.deleteMany({
                    where: { userId, courseId },
                });
            }
        });

        revalidatePath('/ivy/payments/lecture-payments');
        return { success: true };
    } catch (error) {
        console.error('MANUAL_REFUND_ERROR', error);
        return { success: false, message: '환불 처리 실패' };
    }
}

/** -------------------------------
 * 🔥 결제 이력(로그) 조회 액션
 -------------------------------- */
export async function getPaymentLogAction(orderId: string) {
    try {
        const order = await ivyDb.order.findUnique({
            where: { id: orderId },
            include: {
                payments: {
                    orderBy: { createdAt: 'asc' },
                },
                user: {
                    select: { username: true, email: true, phone: true },
                },
            },
        });

        if (!order) throw new Error('주문 내역을 찾을 수 없습니다.');

        return { success: true, data: order };
    } catch (error) {
        console.error('GET_LOG_ERROR', error);
        return { success: false, message: '이력을 불러오는 중 오류 발생' };
    }
}
