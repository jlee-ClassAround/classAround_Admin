'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import { getIsAdmin } from '@/lib/is-admin';
import { CouponSchema } from '@/lib/cojooboo/schemas';

// ================================
//  🔵 단일 쿠폰 삭제
// ================================
export async function deleteCouponAction(couponId: string) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return { success: false, error: 'Unauthorized' };

        await cojoobooDb.coupon.delete({
            where: { id: couponId },
        });

        return { success: true };
    } catch (e) {
        console.error('[deleteCouponAction]', e);
        return { success: false, error: 'Internal Server Error' };
    }
}

// ================================
//  🔵 여러 쿠폰 삭제
// ================================
export async function deleteCouponsAction(couponIds: string[]) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return { success: false, error: 'Unauthorized' };

        await cojoobooDb.coupon.deleteMany({
            where: { id: { in: couponIds } },
        });

        return { success: true };
    } catch (e) {
        console.error('[deleteCouponsAction]', e);
        return { success: false, error: 'Internal Server Error' };
    }
}

// ================================
//  🔵 쿠폰 수정
// ================================
export async function updateCouponAction(couponId: string, values: CouponSchema) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return { success: false, error: 'Unauthorized' };

        const coupon = await cojoobooDb.coupon.update({
            where: { id: couponId },
            data: {
                ...values,
                courses: {
                    set: values.courses?.map((course) => ({ id: course.id })),
                },
            },
        });

        return { success: true, data: coupon };
    } catch (e) {
        console.error('[updateCouponAction]', e);
        return { success: false, error: 'Internal Server Error' };
    }
}
