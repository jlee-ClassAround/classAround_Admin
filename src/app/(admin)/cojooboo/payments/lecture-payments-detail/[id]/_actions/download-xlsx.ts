'use client';

import * as XLSX from 'xlsx';

export type DownloadLecturePaymentRow = {
    buyerName?: string | null;
    buyerPhone?: string | null;
    buyerEmail?: string | null;

    paidAt?: Date | string | null;

    paymentMethod?: string | null;
    netAmount?: number | null;

    paymentStatus?: string | null;
    orderStatus?: string | null;

    receiptUrl?: string | null;

    // 있으면 같이 뽑히도록(없으면 빈 값)
    courseTitle?: string | null;
    courseId?: string | null;

    cancelAmount?: number | null;
    // canceledAt?: Date | string | null;
};

function toKoreanPaymentStatus(status: string): string {
    switch (String(status ?? '').toUpperCase()) {
        case 'DONE':
            return '결제완료';
        case 'CANCELED':
            return '환불됨';
        case 'PARTIAL_CANCELED':
            return '부분환불';
        case 'WAITING_FOR_DEPOSIT':
            return '입금대기';
        case 'WAITING_FOR_DIRECT_DEPOSIT':
            return '입금확인대기';
        case 'FAILED':
            return '실패';
        case 'READY':
        default:
            return '결제대기';
    }
}

function toKoreanDateTime(v: unknown): string {
    if (!v) return '';
    const d = v instanceof Date ? v : new Date(String(v));
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('ko-KR');
}

export function downloadLecturePaymentsXLSX(
    data: DownloadLecturePaymentRow[],
    filename: string
): void {
    // ✅ columns.tsx 기준으로 쭉 뽑음 (+ 있으면 강의명/환불정보도 같이)
    const rows = data.map((item) => ({
        강의명: item.courseTitle ?? '',
        courseId: item.courseId ?? '',
        구매자: item.buyerName ?? '',
        전화번호: item.buyerPhone ?? '',
        이메일: item.buyerEmail ?? '',
        결제일: toKoreanDateTime(item.paidAt),
        결제수단: item.paymentMethod ?? '',
        결제금액: item.netAmount ?? 0,
        결제상태: toKoreanPaymentStatus(item.paymentStatus ?? ''),
        주문상태: item.orderStatus ?? '',
        환불금액: item.cancelAmount ?? 0,
        // 환불일: toKoreanDateTime(item.canceledAt),
        영수증URL: item.receiptUrl ?? '',
    }));

    const ws = XLSX.utils.json_to_sheet(rows, {
        header: [
            '강의명',
            'courseId',
            '구매자',
            '전화번호',
            '이메일',
            '결제일',
            '결제수단',
            '결제금액',
            '결제상태',
            '주문상태',
            '환불금액',
            // '환불일',
            '영수증URL',
        ],
    });

    // 숫자 컬럼 포맷(원하면 더 예쁘게 가능)
    // 결제금액/환불금액 컬럼을 숫자로 유지시키는 정도만
    // (json_to_sheet가 기본적으로 숫자면 숫자로 들어감)

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '결제내역');

    const arrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([arrayBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
}
