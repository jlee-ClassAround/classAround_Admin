import { NextResponse } from 'next/server';
import { ivyDb } from '@/lib/ivyDb';

import { revalidateTag } from 'next/cache';
import { getIsAdmin } from '@/lib/is-admin';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ heroSliderId: string }> }
) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { heroSliderId } = await params;
        const values = await req.json();

        const heroSlider = await ivyDb.heroSlider.update({
            where: { id: heroSliderId },
            data: values,
        });

        revalidateTag('hero-slides');
        return NextResponse.json(heroSlider);
    } catch (error) {
        console.error('[PATCH /api/hero-sliders/[heroSliderId]]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ heroSliderId: string }> }
) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { heroSliderId } = await params;
        await ivyDb.heroSlider.delete({
            where: { id: heroSliderId },
        });

        revalidateTag('hero-slides');
        return NextResponse.json({ message: '삭제되었습니다.' });
    } catch (error) {
        console.error('[DELETE /api/hero-sliders/[heroSliderId]]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
