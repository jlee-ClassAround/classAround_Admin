'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import { getIsAdmin } from '@/lib/is-admin';
import { revalidateTag } from 'next/cache';

// 공통 리빌리데이트 함수
function revalidateAllProductBadgeTags() {
    revalidateTag('best-courses');
    revalidateTag('single-course');
    revalidateTag('free-courses');
    revalidateTag('single-free-course');
    revalidateTag('ebooks');
    revalidateTag('single-ebook');
}

// ===============================
// 📌 Product Badge 생성
// ===============================
export async function createProductBadgeAction(values: any) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return { success: false, error: 'Unauthorized' };

        const badge = await cojoobooDb.productBadge.create({
            data: { ...values },
        });

        revalidateAllProductBadgeTags();

        return { success: true, data: badge };
    } catch (error) {
        console.error('[PRODUCT_BADGE_CREATE]', error);
        return { success: false, error: 'Internal Server Error' };
    }
}

// ===============================
// 📌 Product Badge 여러 개 삭제
// ===============================
export async function deleteProductBadgesAction(ids: string[]) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return { success: false, error: 'Unauthorized' };

        await cojoobooDb.productBadge.deleteMany({
            where: { id: { in: ids } },
        });

        revalidateAllProductBadgeTags();

        return { success: true };
    } catch (error) {
        console.error('[PRODUCT_BADGE_DELETE_MANY]', error);
        return { success: false, error: 'Internal Server Error' };
    }
}

// ===============================
// 📌 Product Badge 단일 수정
// ===============================
export async function updateProductBadgeAction(id: string, values: any) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return { success: false, error: 'Unauthorized' };

        const badge = await cojoobooDb.productBadge.update({
            where: { id },
            data: { ...values },
        });

        revalidateAllProductBadgeTags();

        return { success: true, data: badge };
    } catch (error) {
        console.error('[PRODUCT_BADGE_UPDATE]', error);
        return { success: false, error: 'Internal Server Error' };
    }
}

// ===============================
// 📌 Product Badge 단일 삭제
// ===============================
export async function deleteProductBadgeAction(id: string) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return { success: false, error: 'Unauthorized' };

        await cojoobooDb.productBadge.delete({
            where: { id },
        });

        revalidateAllProductBadgeTags();

        return { success: true };
    } catch (error) {
        console.error('[PRODUCT_BADGE_DELETE_ONE]', error);
        return { success: false, error: 'Internal Server Error' };
    }
}
