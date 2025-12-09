import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { DashboardStats } from '@/components/dashboard-stats';
import { DashboardChart } from '@/components/ui/ivy/dashboard-chart';
import { DashboardLatestOrders } from '@/components/dashboard-latest-orders';
import getDashboardStats from './_actions/dashboard/get-dashboard-stats';

export default async function IvyAdminDashboard() {
    const { orders, totalUsers, todayUsers, totalRevenue, latestOrders } =
        await getDashboardStats();

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
