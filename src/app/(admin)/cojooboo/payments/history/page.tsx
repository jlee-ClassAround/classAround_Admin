import { Card } from '@/components/ui/card';
import { PaymentDataTable } from './_components/payment-data-table';
import { PaymentStats } from './_components/payment-stats';
import { StatsChart } from './_components/stats-chart';
import { getAdminCourses } from '../../_actions/courses/get-admin-courses';
import { getPaymentStats } from '../../_actions/payments/get-payment-stats';
import { getPayments } from '../../_actions/payments/get-payments';
import { getDailyStats } from '../../_actions/payments/get-daily-stats';

interface PageProps {
    searchParams: Promise<{
        from?: string;
        to?: string;
        status?: string;
        type?: string;
        courseId?: string;
        search?: string;
    }>;
}

export default async function AdminPaymentsPage({ searchParams }: PageProps) {
    const { from, to, status, type, courseId, search } = await searchParams;

    const dateRange =
        from && to
            ? {
                  from: new Date(from),
                  to: new Date(to),
              }
            : undefined;

    const [stats, payments, dailyStats, courses] = await Promise.all([
        getPaymentStats({ dateRange, status, type, courseId, search }),
        getPayments({ dateRange, status, type, courseId, search }),
        getDailyStats({ dateRange, status, type, courseId, search }),
        getAdminCourses(),
    ]);

    const courseOptions = courses.map((course) => ({
        id: course.id,
        title: course.title,
    }));

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">결제 내역</h1>

            <PaymentStats stats={stats} />

            {/* {dailyStats.length > 0 && <StatsChart data={dailyStats} />} */}

            <Card className="p-6">
                <PaymentDataTable data={payments} courseOptions={courseOptions} />
            </Card>
        </div>
    );
}
