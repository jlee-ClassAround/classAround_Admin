import { Card } from '@/components/ui/card';
import { getLecturePaymentStatsByOrder } from './_actions/get-payments-stats';
import { PaymentStats } from './_components/payment-stats';
import { LecturePaymentDetailDataTable } from './_components/lecture-payment-data-table';
import { getLecturePaymentsByOrder } from './actions';
import { cojoobooDb } from '@/lib/cojoobooDb';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
    searchParams: Promise<{
        status?: string;
        type?: string;
        search?: string;
    }>;
}
export default async function AdminLecturePaymentsPageDetail({ params, searchParams }: PageProps) {
    const { id } = await params;
    const { status, type, search } = await searchParams;

    const courseId = id;
    const course = await cojoobooDb.course.findFirst({
        where: {
            id: courseId,
        },
        select: {
            title: true,
        },
    });

    // const [stats, payments, dailyStats, courses] = await Promise.all([
    //     getLecturePaymentStats({ courseId }),
    //     getLecturePayments({ dateRange, status, type, courseId, search }),
    //     getDailyStats({ dateRange, status, type, courseId, search }),
    //     getAdminDetailCourses({ courseId }),
    // ]);

    // const courseOptions = courses.map((course) => ({
    //     id: course.id,
    //     title: course.title,
    //     freeCourseId: course.freeCourseId || null,
    // }));

    // const {
    //     payments: mergedPayments,
    //     trackingStats,
    //     newUserStats,
    //     trackingSummary,
    // } = await getTrackingMergedPayments({
    //     freeCourseId: courseOptions[0].freeCourseId,
    //     courseId,
    //     payments,
    // });
    const [stats] = await Promise.all([getLecturePaymentStatsByOrder({ courseId })]);
    const { rows } = await getLecturePaymentsByOrder({ courseId });

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">{course?.title}</h1>
            <PaymentStats stats={stats} />

            <Card className="p-6">
                <LecturePaymentDetailDataTable data={rows} />
            </Card>
        </div>
    );
}
