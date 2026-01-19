'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import { revalidatePath } from 'next/cache';

export async function syncPaymentsByCourseAction(courseId: string) {
    try {
        const subCourses = await cojoobooDb.course.findMany({
            where: { parentId: courseId },
            select: { id: true },
        });
        const targetCourseIds = [courseId, ...subCourses.map((c) => c.id)];

        const tossCustomers = await cojoobooDb.tossCustomer.findMany({
            where: { courseId: { in: targetCourseIds } },
        });

        if (tossCustomers.length === 0) {
            return { success: false, message: '동기화할 데이터가 없습니다.' };
        }

        const orderIds = tossCustomers.map((tc) => tc.orderId);
        const paymentKeys = tossCustomers.map((tc) => tc.paymentKey);

        // 1. Order 데이터 준비
        const orderData = tossCustomers.map((tc) => ({
            id: tc.orderId,
            orderName: tc.orderName,
            orderNumber: tc.orderId.split('_')[0] || tc.orderId,
            amount: tc.finalPrice,
            paidAmount: tc.finalPrice,
            remainingAmount: 0,
            status: 'PAID' as any,
            userId: tc.userId,
            originalPrice: tc.originalPrice || 0,
            discountedPrice: tc.discountPrice,
            createdAt: tc.createdAt,
            updatedAt: tc.updatedAt,
        }));

        // 2. OrderItem 데이터 준비
        const orderItemData = tossCustomers.map((tc) => ({
            id: `ITEM_${tc.orderId}`,
            orderId: tc.orderId,
            productId: tc.productId,
            productTitle: tc.productTitle,
            productCategory: 'COURSE' as any,
            courseId: tc.courseId,
            quantity: 1,
            originalPrice: tc.originalPrice || 0,
            discountedPrice: tc.discountPrice,
            createdAt: tc.createdAt,
            updatedAt: tc.updatedAt,
        }));

        // 3. Payment 데이터 준비 (✅ receiptUrl 추가됨!)
        const paymentData = tossCustomers.map((tc) => ({
            id: tc.paymentKey,
            tossPaymentKey: tc.paymentKey,
            orderId: tc.orderId,
            amount: tc.finalPrice,
            paymentStatus: 'DONE' as any,
            paymentMethod: 'CARD' as any,
            receiptUrl: tc.receiptUrl, // 👈 여기서 영수증 주소를 가져옵니다!
            fee: 0,
            createdAt: tc.createdAt,
            updatedAt: tc.updatedAt,
        }));

        // 4. 트랜잭션 실행
        await cojoobooDb.$transaction(
            async (tx) => {
                await tx.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
                await tx.payment.deleteMany({ where: { id: { in: paymentKeys } } });
                await tx.order.deleteMany({ where: { id: { in: orderIds } } });

                await tx.order.createMany({ data: orderData, skipDuplicates: true });
                await tx.orderItem.createMany({ data: orderItemData, skipDuplicates: true });
                await tx.payment.createMany({ data: paymentData, skipDuplicates: true });
            },
            {
                timeout: 20000,
            }
        );

        revalidatePath('/cojooboo/payments/lecture-payments');
        return { success: true, count: tossCustomers.length };
    } catch (error) {
        console.error('SYNC_ERROR', error);
        return { success: false, message: '동기화 중 오류 발생' };
    }
}
