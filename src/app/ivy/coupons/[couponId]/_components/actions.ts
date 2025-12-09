'use server';

import { ivyDb } from '@/lib/ivyDb';
import { getIsAdmin } from '@/lib/is-admin';
import { CouponSchema } from '@/lib/ivy/schemas';
import { revalidateTag } from 'next/cache';

// 1) 쿠폰 생성
export async function createCouponAction(values: CouponSchema) {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) throw new Error('Unauthorized');

    const coupon = await ivyDb.coupon.create({
        data: {
            ...values,
            courses: values.courses
                ? { connect: values.courses.map((c) => ({ id: c.id })) }
                : undefined,
        },
    });

    revalidateTag('coupons');
    revalidateTag('single-coupon');

    return coupon;
}

// 2) 쿠폰 수정
export async function updateCouponAction(couponId: string, values: CouponSchema) {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) throw new Error('Unauthorized');

    const coupon = await ivyDb.coupon.update({
        where: { id: couponId },
        data: {
            ...values,
            courses: {
                set: values.courses?.map((c) => ({ id: c.id })) ?? [],
            },
        },
    });

    revalidateTag('coupons');
    revalidateTag('single-coupon');

    return coupon;
}

// 3) 단일 삭제
export async function deleteCouponAction(couponId: string) {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) throw new Error('Unauthorized');

    await ivyDb.coupon.delete({
        where: { id: couponId },
    });

    revalidateTag('coupons');
    return true;
}

// 4) 여러개 삭제
export async function bulkDeleteCouponsAction(ids: string[]) {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) throw new Error('Unauthorized');

    await ivyDb.coupon.deleteMany({
        where: { id: { in: ids } },
    });

    revalidateTag('coupons');

    return true;
}
