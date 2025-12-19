'use server';

import { ivyDb } from '@/lib/ivyDb';
import { Prisma } from '@/generated/ivy';
import { DateRange } from 'react-day-picker';

export async function getPayments({
    dateRange,
    status,
    type,
    courseId,
    search,
}: {
    dateRange?: DateRange;
    status?: string;
    type?: string;
    courseId?: string;
    search?: string;
} = {}) {
    try {
        // ---------------------------
        // 1) TossPayment whereClause
        // ---------------------------
        let whereClause: Prisma.TossCustomerWhereInput = {};

        if (dateRange?.from) {
            whereClause.createdAt = {
                gte: dateRange.from,
                lte: dateRange.to ? new Date(dateRange.to.setHours(23, 59, 59)) : undefined,
            };
        }

        if (status && status !== 'ALL') {
            whereClause.paymentStatus = status;
        }

        if (type && type !== 'ALL') {
            whereClause.productType = type;
        }

        if (courseId && type === 'COURSE') {
            whereClause.courseId = courseId;
        }

        if (search) {
            whereClause.OR = [
                {
                    user: {
                        OR: [
                            { username: { contains: search } },
                            { email: { contains: search } },
                            { phone: { contains: search } },
                        ],
                    },
                },
                { course: { title: { contains: search } } },
                { orderId: { contains: search } },
                { orderName: { contains: search } },
            ];
        }

        // ---------------------------
        // 2) TossPayments 조회
        // ---------------------------
        const tossPayments = await ivyDb.tossCustomer.findMany({
            where: whereClause,
            include: {
                user: { select: { username: true, email: true, phone: true } },
                course: { select: { title: true } },
                ebook: { select: { title: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        // ---------------------------
        // 3) cashPayment whereClause
        // ---------------------------
        let cashWhere: any = {};

        if (dateRange?.from) cashWhere.createdAt = whereClause.createdAt;
        if (status && status !== 'ALL') cashWhere.paymentStatus = status;
        if (type && type !== 'ALL') cashWhere.productType = type;

        if (courseId && type === 'COURSE') cashWhere.courseId = courseId;

        if (search) {
            cashWhere.OR = [
                {
                    user: {
                        OR: [{ username: { contains: search } }, { phone: { contains: search } }],
                    },
                },
            ];
        }

        // ---------------------------
        // 4) cashPayment 조회
        // ---------------------------
        // const cashPaymentsRaw = await ivyDb.cashPayment.findMany({
        //     where: cashWhere,
        //     include: {
        //         user: { select: { id: true, username: true, phone: true, email: true } },
        //         course: { select: { title: true } },
        //         ebook: { select: { title: true } },
        //     },
        //     orderBy: { createdAt: 'desc' },
        // });

        // ---------------------------
        // 5) cashPayment → UI용 통합 형식 변환
        // ---------------------------
        // const cashPayments = cashPaymentsRaw.map((c) => ({
        //     id: c.id,
        //     orderId: null,
        //     orderName: c.productTitle,
        //     productName: c.productTitle,
        //     productType: c.productType,
        //     paymentMethod: 'CASH',
        //     paymentStatus: c.paymentStatus,
        //     finalPrice: c.price,
        //     cancelAmount: c.cancelAmount,
        //     createdAt: c.createdAt,
        //     userId: c.user?.id,
        //     user: c.user,
        //     courseId: c.courseId,
        //     course: c.course,
        //     ebook: c.ebook,
        //     receiptUrl: null,
        //     isCash: true, // 🔥 옵션: UI에서 구분 가능
        // }));

        // ---------------------------
        // 6) 통합
        // ---------------------------
        const merged = [...tossPayments];
        // const merged = [...tossPayments, ...cashPayments];

        merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return merged;
    } catch (error) {
        console.error('[GET_PAYMENTS_ERROR]', error);
        throw new Error('결제 내역을 불러오는데 실패했습니다.');
    }
}
