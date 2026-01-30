'use client';

import { useEffect, useState } from 'react';
import { getPaymentLogAction } from '../actions';
import { formatPrice, dateFormat } from '@/utils/formats';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle2, XCircle, FileText, Calendar, User, Info } from 'lucide-react';

interface PaymentLogViewProps {
    orderId: string;
}

export function PaymentLogView({ orderId }: PaymentLogViewProps) {
    const [logData, setLogData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLog() {
            const res = await getPaymentLogAction(orderId);
            if (res.success) {
                setLogData(res.data);
            }
            setLoading(false);
        }
        fetchLog();
    }, [orderId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 gap-2">
                <Loader2 className="animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">결제 이력을 불러오는 중입니다...</p>
            </div>
        );
    }

    if (!logData) {
        return (
            <div className="p-10 text-center border rounded-lg border-dashed">
                <Info className="mx-auto w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                    상세 이력 데이터가 존재하지 않습니다.
                </p>
            </div>
        );
    }

    const isCashOrder = logData.id.startsWith('CASH_');

    return (
        <div className="space-y-8 py-2">
            {/* 👤 고객 요약 정보 섹션 */}
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-full shadow-sm border">
                        <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold">
                            {logData.user?.username || '미등록 사용자'}
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                            {logData.user?.phone || '번호 없음'} ·{' '}
                            {logData.user?.email || '이메일 없음'}
                        </p>
                    </div>
                </div>
                <Badge variant={isCashOrder ? 'outline' : 'default'} className="text-[10px] h-5">
                    {isCashOrder ? '현금/수동결제' : '시스템 자동결제'}
                </Badge>
            </div>

            {/* ⏳ 결제 타임라인 섹션 */}
            <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-muted-foreground/20">
                {/* [NODE 1] 주문/업로드 시점 */}
                <div className="relative pl-10">
                    <div className="absolute left-0 top-1 p-1 bg-blue-500 rounded-full text-white ring-4 ring-white shadow-sm">
                        <FileText className="w-3 h-3" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-blue-600">
                                {isCashOrder
                                    ? '현금 결제 데이터 수동 업로드'
                                    : '시스템 주문 데이터 생성'}
                            </p>
                            <span className="text-[11px] text-muted-foreground">
                                {dateFormat(logData.createdAt)}
                            </span>
                        </div>
                        <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-xs">
                            <p className="font-semibold mb-1 text-blue-900">
                                📦 {logData.orderName}
                            </p>
                            <p className="text-blue-700/70">
                                결제 요청 금액: {formatPrice(logData.amount)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* [NODE 2 & 3] 결제 완료 및 환불 시점 처리 */}
                {logData.payments?.map((p: any) => {
                    const isCanceled =
                        p.paymentStatus === 'CANCELED' || p.paymentStatus === 'PARTIAL_CANCELED';

                    return (
                        <div key={p.id} className="space-y-6">
                            {/* (A) 결제 완료 단계: 환불된 건이라도 '결제 성공' 시점은 무조건 표시 */}
                            <div className="relative pl-10">
                                <div className="absolute left-0 top-1 p-1 bg-green-500 rounded-full text-white ring-4 ring-white shadow-sm">
                                    <CheckCircle2 className="w-3 h-3" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold text-green-600">
                                            결제 완료 처리
                                        </p>
                                        <span className="text-[11px] text-muted-foreground">
                                            {dateFormat(p.createdAt)}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-green-50/30 rounded-lg border border-green-100 text-xs">
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="secondary"
                                                className="text-[10px] h-4 px-1 leading-none"
                                            >
                                                {p.paymentMethod}
                                            </Badge>
                                            <span className="font-bold text-green-700">
                                                {formatPrice(p.amount)} 입금 확인
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* (B) 환불 처리 단계: 상태가 CANCELED일 때만 별도 노드로 표시 */}
                            {isCanceled && (
                                <div className="relative pl-10">
                                    <div className="absolute left-0 top-1 p-1 bg-red-500 rounded-full text-white ring-4 ring-white shadow-sm">
                                        <XCircle className="w-3 h-3" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-bold text-red-600">
                                                결제 취소 및 환불 완료
                                            </p>
                                            <span className="text-[11px] text-muted-foreground">
                                                {dateFormat(p.canceledAt || p.updatedAt)}
                                            </span>
                                        </div>
                                        <div className="p-3 bg-red-50/30 rounded-lg border border-red-100 text-xs">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold text-red-700">
                                                    환불 금액:{' '}
                                                    {formatPrice(p.cancelAmount || p.amount)}
                                                </span>
                                                <Badge
                                                    variant="destructive"
                                                    className="text-[9px] h-4"
                                                >
                                                    환불완료
                                                </Badge>
                                            </div>
                                            <div className="mt-2 space-y-1 border-t pt-2 border-red-200/50">
                                                <div className="flex items-center gap-1.5 text-red-700 font-semibold mb-1">
                                                    <Info className="w-3 h-3" />
                                                    <span>상세 사유</span>
                                                </div>
                                                <p className="text-red-600/90 leading-relaxed bg-white/50 p-2 rounded border border-red-100">
                                                    {p.cancelReason || '단순 변심'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <Separator />

            {/* ℹ️ 하단 안내 문구 */}
            <div className="flex items-start gap-2 text-[10px] text-muted-foreground px-1 leading-relaxed">
                <Calendar className="w-3 h-3 mt-0.5 shrink-0" />
                <p>
                    본 타임라인은 결제 데이터의 상태 변경 이력을 기반으로 자동 생성되었습니다.
                    <br />
                    수동 환불 처리 시 입력한 사유는 환불 완료 시점의 상세 로그에 영구 보존됩니다.
                </p>
            </div>
        </div>
    );
}
