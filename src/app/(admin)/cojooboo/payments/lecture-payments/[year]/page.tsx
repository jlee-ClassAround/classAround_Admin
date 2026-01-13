import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { getPayments } from '../_actions/get-payments';
import { getDailyStats } from '../../../_actions/payments/get-daily-stats';
import { getAdminCourses } from '../../../_actions/courses/get-admin-courses';
import { PaymentStats } from '../../history/_components/payment-stats';
import { PaymentDataTable } from '../_components';
import { columns } from './columns';
import { getPaymentStats } from '../_actions/get-payments-stats';
import { getCoursesWithCustomer } from './actions';

interface PageProps {
    params: Promise<{
        year: string;
    }>;
    searchParams: Promise<{
        from?: string;
        to?: string;
        status?: string;
        type?: string;
        courseId?: string;
        search?: string;
    }>;
}

export default async function AdminLecturePaymentsPage({ params, searchParams }: PageProps) {
    const { year } = await params;
    const { from, to, status, type, courseId, search } = await searchParams;

    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
        throw new Error('Invalid year');
    }
    const dateRange =
        from && to
            ? {
                  from: new Date(from),
                  to: new Date(to),
              }
            : {
                  from: new Date(yearNum, 0, 1),
                  to: new Date(yearNum + 1, 0, 1),
              };

    const [stats] = await Promise.all([
        getPaymentStats({ dateRange, status, type, courseId, search }),
    ]);
    const data = await getCoursesWithCustomer(yearNum);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">{year}년 결제 내역</h1>
            <PaymentStats stats={stats} />

            <Card className="p-6">
                <PaymentDataTable
                    columns={columns}
                    data={data}
                    searchKey="title"
                    searchPlaceholder="강의명을 검색해보세요."
                />
            </Card>
        </div>
    );
}
