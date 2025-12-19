import { Card } from '@/components/ui/card';
import { getLecturePaymentStatsByOrder } from './_actions/get-payments-stats';
import { PaymentStats } from './_components/payment-stats';
import { LecturePaymentDetailDataTable } from './_components/lecture-payment-data-table';
import { getLecturePaymentsByOrder } from './actions';
import { ivyDb } from '@/lib/ivyDb';

interface PageProps {
    params: Promise<{ id: string }>;
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

    const course = await ivyDb.course.findFirst({
        where: { id: courseId },
        select: { title: true },
    });

    const [stats, payments] = await Promise.all([
        getLecturePaymentStatsByOrder({ courseId }),
        getLecturePaymentsByOrder({ courseId, status, type, search }),
    ]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">{course?.title}</h1>

            <PaymentStats stats={stats} />

            <Card className="p-6">
                <LecturePaymentDetailDataTable data={payments.rows} />
            </Card>
        </div>
    );
}
