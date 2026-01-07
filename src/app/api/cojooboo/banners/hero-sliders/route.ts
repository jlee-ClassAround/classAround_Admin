import { NextResponse } from 'next/server';

import { revalidateTag } from 'next/cache';
import { getIsAdmin } from '@/lib/is-admin';
import { cojoobooDb } from '@/lib/cojoobooDb';

export async function POST(req: Request) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const values = await req.json();

        const heroSlider = await cojoobooDb.heroSlider.create({
            data: values,
        });

        revalidateTag('hero-slides');

        return NextResponse.json(heroSlider);
    } catch (error) {
        console.error('[POST /api/hero-sliders]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { ids } = await req.json();

        await cojoobooDb.heroSlider.deleteMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });

        revalidateTag('hero-slides');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[DELETE /api/hero-sliders]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
