'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/utils/formats';
// import { TrackingStatsTable } from './tracking-stats-table';

interface PaymentStatsProps {
    stats: {
        totalOrders: number;
        totalPaymentAmount: number;
        totalRefundAmount: number;
        finalPaymentAmount: number;
        couponUsageCount: number;
        totalDiscountAmount: number;
        refundStatsCount: number;
    };
    // trackingStats: Record<string, number>;
    // newUserStats: Record<
    //     string,
    //     { newCount: number; newPaymentCount: number; newPaymentRevenue: number }
    // >;
    // trackingSummary: Record<
    //     string,
    //     { visitCount: number; paymentCount: number; totalRevenue: number; conversionRate: string }
    // >;
}

export function PaymentStats({
    stats,
}: // newUserStats,
// trackingSummary,
PaymentStatsProps) {
    // const totalTrackingAmount = Object.values(trackingStats).reduce((sum, v) => sum + v, 0);
    const totalRevenue = stats.totalPaymentAmount - stats.totalRefundAmount;

    return (
        <div className="flex flex-col gap-6">
            {/* ------------------------ 1행: 요약 카드 ------------------------ */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* 순이익 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">순이익</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatPrice(totalRevenue)}원</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.totalOrders - stats.refundStatsCount}건
                        </p>
                    </CardContent>
                </Card>

                {/* 총매출 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">총매출</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatPrice(stats.totalPaymentAmount)}원
                        </div>
                        <p className="text-xs text-muted-foreground">총 {stats.totalOrders}건</p>
                    </CardContent>
                </Card>

                {/* 환불 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">환불 금액</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatPrice(stats.totalRefundAmount)}원
                        </div>
                        <p className="text-xs text-muted-foreground">{stats.refundStatsCount}건</p>
                    </CardContent>
                </Card>

                {/* 쿠폰 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">쿠폰 사용</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.couponUsageCount}건</div>
                        <p className="text-xs text-muted-foreground">
                            할인액 {formatPrice(stats.totalDiscountAmount)}원
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">유입경로별 매출</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <TrackingStatsTable
                            trackingStats={trackingStats}
                            newUserStats={newUserStats}
                            trackingSummary={trackingSummary}
                        />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">RS (신규유입 성과)</CardTitle>
                    </CardHeader>

                    <CardContent>
                        {Object.keys(newUserStats).length === 0 ? (
                            <div className="text-sm text-muted-foreground">정보 없음</div>
                        ) : (
                            <div className="rounded-md border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted">
                                        <tr className="border-b">
                                            <th className="px-3 py-2 text-left">항목</th>
                                            <th className="px-3 py-2 text-right">결제/유입</th>
                                            <th className="px-3 py-2 text-right">매출</th>
                                            <th className="px-3 py-2 text-right">전환율</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {Object.entries(newUserStats).map(([medium, s]) => {
                                            const rate =
                                                s.newCount > 0
                                                    ? (
                                                          (s.newPaymentCount / s.newCount) *
                                                          100
                                                      ).toFixed(1)
                                                    : '0';

                                            return (
                                                <tr key={medium} className="border-b">
                                                    <td className="px-3 py-2">{medium}</td>
                                                    <td className="px-3 py-2 text-right">
                                                        {s.newPaymentCount}/{s.newCount}
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-semibold">
                                                        {formatPrice(s.newPaymentRevenue)}원
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        {rate}%
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div> */}
        </div>
    );
}
