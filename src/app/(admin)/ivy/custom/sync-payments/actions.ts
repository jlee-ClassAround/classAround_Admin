'use server';

import { ivyDb } from '@/lib/ivyDb';
import { revalidatePath } from 'next/cache';

export async function syncPaymentsByCourseAction(courseId: string) {
    try {
        // 1. 메인 강의를 parentId로 가진 하위(파생) 강의들의 ID를 모두 가져옵니다.
        const subCourses = await ivyDb.course.findMany({
            where: { parentId: courseId },
            select: { id: true },
        });

        // 2. 조회 대상이 될 모든 강의 ID 리스트를 만듭니다. (메인 ID + 파생 ID들)
        const targetCourseIds = [courseId, ...subCourses.map((c) => c.id)];

        // 3. 대상 ID 리스트에 포함된 모든 TossCustomer 데이터를 가져옵니다.
        const tossCustomers = await ivyDb.tossCustomer.findMany({
            where: {
                courseId: { in: targetCourseIds },
            },
            include: { user: true },
        });

        if (tossCustomers.length === 0) {
            return { success: false, message: '동기화할 TossCustomer 데이터가 없습니다.' };
        }

        const orderIds = tossCustomers.map((tc) => tc.orderId);
        const paymentKeys = tossCustomers.map((tc) => tc.paymentKey);

        // 4. 트랜잭션 시작 (기존 데이터 초기화 및 재주입)
        await ivyDb.$transaction(async (tx) => {
            // [삭제] 외래 키 제약 조건을 피하기 위해 자식부터 삭제
            await tx.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
            await tx.payment.deleteMany({ where: { id: { in: paymentKeys } } });
            await tx.order.deleteMany({ where: { id: { in: orderIds } } });

            // [생성]
            for (const tc of tossCustomers) {
                // (1) Order 생성
                await tx.order.create({
                    data: {
                        id: tc.orderId,
                        orderName: tc.orderName,
                        orderNumber: tc.orderId.split('_')[0] || tc.orderId,
                        amount: tc.finalPrice,
                        paidAmount: tc.finalPrice,
                        remainingAmount: 0,
                        status: 'PAID',
                        userId: tc.userId,
                        originalPrice: tc.originalPrice || 0,
                        discountedPrice: tc.discountPrice,
                        createdAt: tc.createdAt,
                        updatedAt: tc.updatedAt,
                    },
                });

                // (2) OrderItem 생성
                // 💡 결산의 편의성을 위해, 파생 강의 결제건이라도
                // OrderItem의 courseId는 선택한 '메인 강의 ID'로 통일하여 저장할 수도 있습니다.
                // 여기서는 원천 데이터의 courseId를 유지하되 필요시 수정하십시오.
                await tx.orderItem.create({
                    data: {
                        id: `ITEM_${tc.orderId}`,
                        orderId: tc.orderId,
                        productId: tc.productId,
                        productTitle: tc.productTitle,
                        productCategory: 'COURSE',
                        courseId: tc.courseId, // 혹은 묶어서 계산하려면 courseId (메인) 사용
                        quantity: 1,
                        originalPrice: tc.originalPrice || 0,
                        discountedPrice: tc.discountPrice,
                        createdAt: tc.createdAt,
                        updatedAt: tc.updatedAt,
                    },
                });

                // (3) Payment 생성
                await tx.payment.create({
                    data: {
                        id: tc.paymentKey,
                        tossPaymentKey: tc.paymentKey,
                        orderId: tc.orderId,
                        amount: tc.finalPrice,
                        paymentStatus: 'DONE',
                        paymentMethod: 'CARD',
                        fee: 0,
                        createdAt: tc.createdAt,
                        updatedAt: tc.updatedAt,
                    },
                });
            }
        });

        revalidatePath('/ivy/payments/lecture-payments');
        return { success: true, count: tossCustomers.length };
    } catch (error) {
        console.error('SYNC_ERROR', error);
        return { success: false, message: '데이터 처리 중 오류가 발생했습니다.' };
    }
}
