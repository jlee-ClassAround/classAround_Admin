import { getAdminCourses } from "@/actions/courses/get-admin-courses";
import { getDailyStats } from "@/actions/payments/get-daily-stats";
import { getPaymentStats } from "@/actions/payments/get-payment-stats";
import { getPayments } from "@/actions/payments/get-payments";
import { Card } from "@/components/ui/card";
import { PaymentDataTable } from "./_components/payment-data-table";
import { PaymentStats } from "./_components/payment-stats";
import { StatsChart } from "./_components/stats-chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { ChevronRight, InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      {/* 
      <Alert>
        <InfoIcon className="size-4" />
        <div className="mt-2">
          <AlertTitle>안내</AlertTitle>
          <AlertDescription>
            현재 페이지에서는 직접계좌이체 내역이 저장되지 않습니다. 새로운
            페이지에서 결제내역을 확인해주세요.
          </AlertDescription>
          <Link
            href="/admin/payments"
            className="inline-flex items-center gap-1 py-1 px-2 border rounded text-xs font-medium mt-2"
          >
            결제관리
            <ChevronRight className="size-3" />
          </Link>
        </div>
      </Alert> */}

      <PaymentStats stats={stats} />

      {/* {dailyStats.length > 0 && <StatsChart data={dailyStats} />} */}

      <Card className="p-6">
        <PaymentDataTable data={payments} courseOptions={courseOptions} />
      </Card>
    </div>
  );
}
