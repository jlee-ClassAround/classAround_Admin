import { AdminDataTable } from "@/app/(admin)/_components/admin-data-table";
import { columns } from "./columns";
import { getDirectDepositTransactions } from "./_queries/get-direct-deposit-transactions";
import { Card, CardContent } from "@/components/ui/card";

export default async function DirectDepositPage() {
  const transactions = await getDirectDepositTransactions();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">직접 계좌이체 관리</h1>

      <Card>
        <CardContent>
          <AdminDataTable
            columns={columns}
            data={transactions}
            noSearch
            defaultPageSize={50}
          />
        </CardContent>
      </Card>
    </div>
  );
}
