import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboardStats, getLatestOrders } from '@/actions/dashboard/get-stats';
import { DashboardStats } from '@/components/dashboard-stats';
import { DashboardChart } from '@/components/dashboard-chart';
import { DashboardLatestOrders } from '@/components/dashboard-latest-orders';

export default async function CojoobooAdminDashboard() {
    const brand = 'cojooboo';

    const [statsResult, ordersResult] = await Promise.all([
        getDashboardStats(brand),
        getLatestOrders(brand, 5),
    ]);

    // 기본값 설정
    const stats = statsResult.data ?? {
        totalUsers: 0,
        todayUsers: 0,
        totalRevenue: 0,
        totalOrders: 0,
    };

    const orders = ordersResult.data ?? [];

    return (
        <div className="space-y-8 p-8">
            <h1 className="text-3xl font-bold">코주부 대시보드</h1>

            {/* 에러 메시지 표시 */}
            {!statsResult.success && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {statsResult.error}
                </div>
            )}

            <DashboardStats
                totalUsers={stats.totalUsers}
                todayUsers={stats.todayUsers}
                totalRevenue={stats.totalRevenue}
            />

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>매출 현황</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DashboardChart orders={orders} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>최근 주문</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DashboardLatestOrders orders={orders} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
