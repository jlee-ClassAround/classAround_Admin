import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { DashboardStats } from "../_components/dashboard-stats";
import { DashboardChart } from "../_components/dashboard-chart";
import { DashboardLatestOrders } from "../_components/dashboard-latest-orders";
import { getPaymentStats } from "@/actions/payments/get-payment-stats";

export default async function AdminDashboard() {
  // 전체 통계 데이터 조회
  const totalUsers = await db.user.count({
    where: {
      OR: [
        { roleId: null },
        {
          NOT: {
            roleId: "admin",
          },
        },
      ],
    },
  });
  const todayUsers = await getUserCountSignedToday();
  const orders = await db.tossCustomer.findMany({
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const latestOrders = orders.slice(0, 5);

  // 총 매출액 계산
  const { totalRevenue } = await getPaymentStats();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">대시보드</h1>

      {/* 통계 카드 */}
      <DashboardStats
        totalUsers={totalUsers}
        todayUsers={todayUsers}
        totalRevenue={totalRevenue}
      />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {/* 차트 */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>매출 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardChart orders={orders} />
          </CardContent>
        </Card>

        {/* 최근 주문 */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>최근 주문</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardLatestOrders orders={latestOrders} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function getUserCountSignedToday() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0); // 오늘 00:00:00

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999); // 오늘 23:59:59

  const todayUsers = await db.user.count({
    where: {
      createdAt: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  return todayUsers;
}
