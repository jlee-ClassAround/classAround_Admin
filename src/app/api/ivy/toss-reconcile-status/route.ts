import { NextRequest, NextResponse } from 'next/server';
import { ivyDb } from '@/lib/ivyDb';
import { getIsAdmin } from '@/lib/is-admin';
import { buildDesiredStateFromTossCustomer } from './actions/buildDesiredStateFromTossCustomer';

export async function POST(req: NextRequest) {
    const isAdmin = await getIsAdmin();
    if (!isAdmin)
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const courseId = url.searchParams.get('courseId');
    const dryRun = url.searchParams.get('dryRun') !== '0';

    try {
        if (!courseId)
            return NextResponse.json({ success: false, error: 'courseId필요' }, { status: 400 });

        const currentCourse = await ivyDb.course.findUnique({
            where: { id: courseId },
            select: { id: true, parentId: true },
        });

        const rootId = currentCourse?.parentId ?? currentCourse?.id ?? courseId;
        const allRelated = await ivyDb.course.findMany({
            where: { OR: [{ id: rootId }, { parentId: rootId }] },
            select: { id: true },
        });
        const targetIds = allRelated.map((c) => c.id);

        const tossCustomers = await ivyDb.tossCustomer.findMany({
            where: { courseId: { in: targetIds } }, // ✅ 목록과 동일한 범위 조회
        });

        let updatedCount = 0;
        for (const tc of tossCustomers) {
            const paymentWithOrder = await ivyDb.payment.findUnique({
                where: { tossPaymentKey: tc.paymentKey },
                include: { order: true },
            });

            if (paymentWithOrder) {
                const desired = await buildDesiredStateFromTossCustomer(
                    tc,
                    paymentWithOrder.order,
                    paymentWithOrder
                );
                if (desired.shouldUpdate) {
                    if (!dryRun) {
                        // ✅ 실제 DB 수정 (Order, Payment)
                        await ivyDb.$transaction([
                            ivyDb.order.update({
                                where: { id: paymentWithOrder.order.id },
                                data: desired.orderPatch,
                            }),
                            ivyDb.payment.update({
                                where: { id: paymentWithOrder.id },
                                data: desired.paymentPatch,
                            }),
                        ]);
                    }
                    updatedCount++;
                }
            }
        }

        return NextResponse.json({ success: true, updatedCount, dryRun });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
