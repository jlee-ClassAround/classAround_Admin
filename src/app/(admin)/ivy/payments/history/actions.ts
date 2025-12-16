'use server';

import { ivyDb } from '@/lib/ivyDb';
import { getIsAdmin } from '@/lib/is-admin';
import { revalidateTag } from 'next/cache';

// 토스에 보낼 시크릿키 암호화
const encryptedSecretKey =
    'Basic ' + Buffer.from(process.env.TOSS_SECRET_KEY! + ':').toString('base64');

interface RefundActionPayload {
    paymentId: string;
    cancelReason?: string;
    cancelAmount?: string;
    isKeepEnrollment: boolean;
}

export async function refundPaymentAction({
    paymentId,
    cancelReason,
    cancelAmount,
    isKeepEnrollment,
}: RefundActionPayload) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return { success: false, error: 'Unauthorized' };

        // 결제 데이터 조회
        const payment = await ivyDb.tossCustomer.findUnique({
            where: { id: paymentId },
            select: {
                id: true,
                paymentKey: true,
                paymentStatus: true,
                finalPrice: true,
                refundableAmount: true,
                productType: true,
                userId: true,
                courseId: true,
                ebookId: true,
            },
        });

        if (!payment) {
            return { success: false, error: '결제 정보를 찾을 수 없습니다.' };
        }

        if (payment.finalPrice === 0) {
            return { success: false, error: '무료 결제는 환불할 수 없습니다.' };
        }

        if (payment.paymentStatus === 'REFUNDED' && payment.refundableAmount === 0) {
            return { success: false, error: '환불 가능한 금액이 없습니다.' };
        }

        // 🔥 1) 토스 API 환불 요청
        const tossRes = await fetch(
            `https://api.tosspayments.com/v1/payments/${payment.paymentKey}/cancel`,
            {
                method: 'POST',
                headers: {
                    Authorization: encryptedSecretKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cancelReason: cancelReason || '구매자가 취소를 원함',
                    cancelAmount: cancelAmount ? Number(cancelAmount) : null,
                }),
            }
        );

        const tossData = await tossRes.json();
        const cancels = tossData.cancels ?? [];
        const latest = cancels[cancels.length - 1];
        const refundableAmount: number = latest?.refundableAmount ?? 0;

        if (!tossRes.ok) {
            return { success: false, error: '토스 환불 요청 실패' };
        }

        // 🔥 2) ivyDb 업데이트 트랜잭션
        await ivyDb.$transaction(async (tx) => {
            const updatedPayment = await tx.tossCustomer.update({
                where: { id: paymentId },
                data: {
                    paymentStatus: refundableAmount > 0 ? 'PARTIAL_REFUNDED' : 'REFUNDED',
                    cancelAmount: payment.finalPrice - (refundableAmount ?? payment.finalPrice),
                    cancelReason: cancelReason || '구매자가 취소를 원함',
                    refundableAmount,
                    canceledAt: new Date(),
                },
            });

            // 🔥 환불 후 수강권 / 이북 권한 삭제 처리
            if (!isKeepEnrollment && updatedPayment.userId) {
                if (updatedPayment.productType === 'COURSE' && updatedPayment.courseId) {
                    await tx.enrollment.deleteMany({
                        where: {
                            userId: updatedPayment.userId,
                            courseId: updatedPayment.courseId,
                        },
                    });
                }

                if (updatedPayment.productType === 'EBOOK' && updatedPayment.ebookId) {
                    await tx.ebookPurchase.deleteMany({
                        where: {
                            userId: updatedPayment.userId,
                            ebookId: updatedPayment.ebookId,
                        },
                    });
                }
            }

            if (updatedPayment.courseId) {
                revalidateTag(`course-${updatedPayment.courseId}`);
            }
        });

        return { success: true };
    } catch (err) {
        console.error('[REFUND_ACTION_ERROR]', err);
        return { success: false, error: '서버 내부 오류' };
    }
}
