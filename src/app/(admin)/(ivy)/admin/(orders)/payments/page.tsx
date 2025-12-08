import { AdminDataTable } from "@/app/(admin)/_components/admin-data-table";
import { Card, CardContent } from "@/components/ui/card";
import { PaymentMethod, PaymentStatus, ProductCategory } from "@prisma/client";
import { DownloadButtons } from "./_components/download-buttons";
import { PaymentFilters } from "./_components/filter";
import { PaymentSummaryCards } from "./_components/payment-summary-cards";
import { getPayments } from "./_queries/get-payments";
import { getPaymentSummary } from "./_queries/get-payment-summary";
import { columns } from "./columns";

interface Props {
  searchParams: Promise<{
    search?: string;
    productCategory?: ProductCategory | "ALL";
    paymentMethod?: PaymentMethod | "ALL";
    taxFree?: string | "ALL";
    paymentStatus?: PaymentStatus | "ALL";
    dateFrom?: string;
    dateTo?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export default async function PaymentsPage({ searchParams }: Props) {
  const {
    search,
    productCategory,
    paymentMethod,
    taxFree,
    paymentStatus,
    dateFrom,
    dateTo,
    page = "1",
    pageSize = "10",
  } = await searchParams;

  const [{ payments, totalCount, totalPages }, summary] = await Promise.all([
    getPayments({
      search,
      productCategory,
      paymentMethod,
      taxFree,
      paymentStatus,
      dateFrom,
      dateTo,
      currentPage: Number(page),
      pageSize: Number(pageSize),
    }),
    getPaymentSummary({
      search,
      productCategory,
      paymentMethod,
      taxFree,
      paymentStatus,
      dateFrom,
      dateTo,
    }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">결제 내역</h1>

      {/* 요약 정보 카드 */}
      <PaymentSummaryCards summary={summary} />

      <Card>
        <CardContent className="space-y-5">
          <PaymentFilters />
          <div className="flex items-center justify-end">
            <DownloadButtons
              filterParams={{
                search,
                productCategory,
                paymentMethod,
                taxFree,
                paymentStatus,
                dateFrom,
                dateTo,
              }}
            />
          </div>
          <AdminDataTable
            data={payments}
            columns={columns}
            noSearch
            isServerSide
            totalCount={totalCount}
            totalPages={totalPages}
            currentPage={Number(page)}
            defaultPageSize={Number(pageSize)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
