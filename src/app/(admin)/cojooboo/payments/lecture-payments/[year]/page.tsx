import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getPaymentStats } from '../_actions/get-payments-stats';
import { getPayments } from '../_actions/get-payments';
import { getDailyStats } from '../../../_actions/payments/get-daily-stats';
import { getAdminCourses } from '../../../_actions/courses/get-admin-courses';

interface PageProps {
    params: {
        year: string;
    };
    searchParams: {
        from?: string;
        to?: string;
        status?: string;
        type?: string;
        courseId?: string;
        search?: string;
    };
}

export default async function AdminLecturePaymentsPage({ params, searchParams }: PageProps) {
    const year = Number(params.year);
    if (!Number.isInteger(year)) {
        throw new Error('Invalid year');
    }
    const { from, to, status, type = 'CARD', courseId, search } = searchParams;

    const dateRange =
        from && to
            ? {
                  from: new Date(from),
                  to: new Date(to),
              }
            : {
                  from: new Date(year, 0, 1),
                  to: new Date(year + 1, 0, 1),
              };

    const [stats, payments, dailyStats, courses] = await Promise.all([
        getPaymentStats({ dateRange, status, type, courseId, search }),
        getPayments({ dateRange, status, type, courseId, search }),
        getDailyStats({ dateRange, status, type, courseId, search }),
        getAdminCourses(),
    ]);
    console.log(stats);
    // const data = await getCoursesWithCustomer();

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">{year}년 결제 내역</h1>
            {/* <PaymentStats stats={stats} /> */}

            <Card className="p-6">
                {/* <PaymentDataTable
                    columns={columns}
                    data={data}
                    searchKey="title"
                    searchPlaceholder="강의명을 검색해보세요."
                /> */}
            </Card>
        </div>
    );
}
