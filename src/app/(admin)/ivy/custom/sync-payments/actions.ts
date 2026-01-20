'use server';

import { ivyDb } from '@/lib/ivyDb';
import { OrderStatus, PaymentStatus, PaymentMethod, ProductCategory } from '@/generated/ivy';
import { revalidatePath } from 'next/cache';

export async function syncPaymentsByCourseAction(courseId: string) {
    try {
        const subCourses = await ivyDb.course.findMany({
            where: { parentId: courseId },
            select: { id: true },
        });
        const targetCourseIds = Array.from(new Set([courseId, ...subCourses.map((c) => c.id)]));

        const allLinkedItems = await ivyDb.orderItem.findMany({
            where: { courseId: { in: targetCourseIds } },
            select: { orderId: true },
        });
        const allOrderIds = Array.from(new Set(allLinkedItems.map((i) => i.orderId)));

        // 1. TossCustomer 데이터 조회 (필드명 교정 및 필수 필드 포함)
        const tossCustomers = await ivyDb.tossCustomer.findMany({
            where: { courseId: { in: targetCourseIds } },
            select: {
                id: true,
                orderId: true,
                orderName: true,
                userId: true,
                productId: true,
                productTitle: true,
                courseId: true,
                finalPrice: true,
                originalPrice: true,
                discountPrice: true,
                paymentStatus: true, // ✅ 'status' 대신 스키마 필드명 사용
                cancelAmount: true,
                refundableAmount: true,
                paymentKey: true,
                receiptUrl: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        await ivyDb.$transaction(
            async (tx) => {
                if (allOrderIds.length > 0) {
                    await tx.orderItem.deleteMany({ where: { orderId: { in: allOrderIds } } });
                    await tx.payment.deleteMany({ where: { orderId: { in: allOrderIds } } });
                    await tx.order.deleteMany({ where: { id: { in: allOrderIds } } });
                }

                if (tossCustomers.length === 0) return;

                const orderData = tossCustomers.map((tc) => {
                    const totalCancel = tc.cancelAmount ?? 0;
                    const isFullRefund =
                        tc.paymentStatus === 'CANCELED' ||
                        (totalCancel >= tc.finalPrice && tc.finalPrice > 0);
                    const isPartialRefund = !isFullRefund && totalCancel > 0;

                    return {
                        id: tc.orderId,
                        orderName: tc.orderName,
                        orderNumber: tc.orderId.split('_')[0] || tc.orderId,
                        amount: tc.finalPrice,
                        paidAmount: tc.finalPrice,
                        remainingAmount: 0, // ✅ [해결] 필수 필드 추가
                        originalPrice: tc.originalPrice || tc.finalPrice || 0, // ✅ [해결] 필수 필드 추가
                        status: isFullRefund
                            ? OrderStatus.REFUNDED
                            : isPartialRefund
                              ? OrderStatus.PARTIAL_REFUNDED
                              : OrderStatus.PAID,
                        userId: tc.userId || null,
                        createdAt: tc.createdAt,
                        updatedAt: tc.updatedAt,
                    };
                });

                const orderItemData = tossCustomers.map((tc) => ({
                    id: `ITEM_${tc.id}`,
                    orderId: tc.orderId,
                    productId: tc.productId,
                    productTitle: tc.productTitle,
                    productCategory: ProductCategory.COURSE,
                    courseId: tc.courseId,
                    quantity: 1,
                    originalPrice: tc.originalPrice || tc.finalPrice || 0,
                    discountedPrice: tc.finalPrice,
                    createdAt: tc.createdAt,
                    updatedAt: tc.updatedAt,
                }));

                const paymentData = tossCustomers.map((tc) => {
                    const totalCancel = tc.cancelAmount ?? 0;
                    const isFullRefund =
                        tc.paymentStatus === 'CANCELED' ||
                        (totalCancel >= tc.finalPrice && tc.finalPrice > 0);
                    const isPartialRefund = !isFullRefund && totalCancel > 0;

                    const netAmount = tc.finalPrice - totalCancel;

                    return {
                        id: tc.paymentKey,
                        tossPaymentKey: tc.paymentKey,
                        orderId: tc.orderId,
                        amount: netAmount,
                        cancelAmount: totalCancel,
                        paymentStatus: isFullRefund
                            ? PaymentStatus.CANCELED
                            : isPartialRefund
                              ? PaymentStatus.PARTIAL_CANCELED
                              : PaymentStatus.DONE,
                        paymentMethod: PaymentMethod.CARD,
                        receiptUrl: tc.receiptUrl,
                        fee: 0,
                        createdAt: tc.createdAt,
                        updatedAt: tc.updatedAt,
                    };
                });

                await tx.order.createMany({ data: orderData, skipDuplicates: true });
                await tx.orderItem.createMany({ data: orderItemData, skipDuplicates: true });
                await tx.payment.createMany({ data: paymentData, skipDuplicates: true });
            },
            { timeout: 30000 }
        );

        revalidatePath('/ivy/payments/lecture-payments');
        return { success: true, count: tossCustomers.length };
    } catch (error) {
        console.error('SYNC_ERROR', error);
        return { success: false, message: '동기화 중 오류 발생' };
    }
}
