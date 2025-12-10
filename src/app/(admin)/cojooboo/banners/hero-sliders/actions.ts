'use server';

import { cojoobooDb } from '@/lib/cojoobooDb';
import { getIsAdmin } from '@/lib/is-admin';
import { revalidateTag } from 'next/cache';

// ===============================
//  📌 단일 생성 (POST)
// ===============================
export async function createHeroSliderAction(values: any) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return { success: false, error: 'Unauthorized' };

        const heroSlider = await cojoobooDb.heroSlider.create({ data: values });

        revalidateTag('hero-slides');

        return { success: true, data: heroSlider };
    } catch (error) {
        console.error('[HERO_SLIDER_CREATE]', error);
        return { success: false, error: 'Internal Server Error' };
    }
}

// ===============================
//  📌 여러 개 삭제 (DELETE MANY)
// ===============================
export async function deleteHeroSlidersAction(ids: string[]) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return { success: false, error: 'Unauthorized' };

        await cojoobooDb.heroSlider.deleteMany({
            where: { id: { in: ids } },
        });

        revalidateTag('hero-slides');

        return { success: true };
    } catch (error) {
        console.error('[HERO_SLIDER_DELETE_MANY]', error);
        return { success: false, error: 'Internal Server Error' };
    }
}

// ===============================
//  📌 단일 수정 (PATCH)
// ===============================
export async function updateHeroSliderAction(id: string, values: any) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return { success: false, error: 'Unauthorized' };

        const updated = await cojoobooDb.heroSlider.update({
            where: { id },
            data: values,
        });

        revalidateTag('hero-slides');
        revalidateTag(`hero-slide-${id}`);

        return { success: true, data: updated };
    } catch (error) {
        console.error('[HERO_SLIDER_UPDATE]', error);
        return { success: false, error: 'Internal Server Error' };
    }
}

// ===============================
//  📌 단일 삭제 (DELETE ONE)
// ===============================
export async function deleteHeroSliderAction(id: string) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return { success: false, error: 'Unauthorized' };

        await cojoobooDb.heroSlider.delete({
            where: { id },
        });

        revalidateTag('hero-slides');

        return { success: true };
    } catch (error) {
        console.error('[HERO_SLIDER_DELETE_ONE]', error);
        return { success: false, error: 'Internal Server Error' };
    }
}
