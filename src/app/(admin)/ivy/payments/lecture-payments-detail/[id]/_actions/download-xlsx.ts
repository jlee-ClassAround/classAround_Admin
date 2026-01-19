'use client';

import * as XLSX from 'xlsx';

/** -------------------------------
 * ✅ 영문 -> 한글 강제 매핑 테이블
 -------------------------------- */
const KR_METHOD: Record<string, string> = {
    CARD: '카드',
    TRANSFER: '계좌이체',
    VIRTUAL_ACCOUNT: '가상계좌',
    DIRECT_DEPOSIT: '무통장입금',
    EASY_PAY: '간편결제',
};

const KR_STATUS: Record<string, string> = {
    DONE: '결제완료',
    CANCELED: '환불됨',
    PARTIAL_CANCELED: '부분환불',
    WAITING_FOR_DEPOSIT: '입금대기',
    WAITING_FOR_DIRECT_DEPOSIT: '입금확인대기',
    FAILED: '실패',
    PAID: '결제완료',
    REFUNDED: '환불됨',
    PENDING: '대기중',
};

/** -------------------------------
 * 🔥 XLSX 다운로드 (날짜 오름차순 정렬 추가)
 -------------------------------- */
export function downloadLecturePaymentsXLSX(data: any[], filename: string): void {
    console.log('엑셀 변환 데이터 가공 시작...');

    // ✅ 1. 날짜 오름차순 정렬 (과거 데이터가 위로)
    const sortedData = [...data].sort((a, b) => {
        const dateA = new Date(a.paidAt || 0).getTime();
        const dateB = new Date(b.paidAt || 0).getTime();
        return dateA - dateB; // 오름차순: A - B
    });

    // 2. 데이터 가공
    const rows = sortedData.map((item) => {
        const method = String(item.paymentMethod || '').toUpperCase();
        const pStatus = String(item.paymentStatus || '').toUpperCase();
        const oStatus = String(item.orderStatus || '').toUpperCase();

        const refundAmt = Number(item.refundAmount || item.cancelAmount || 0);
        const isRefunded = refundAmt > 0 || pStatus === 'CANCELED' || oStatus === 'REFUNDED';
        const displayPaidAmount = isRefunded ? 0 : Number(item.paidAmount || item.amount || 0);

        return {
            강의명: (item.courseTitle || '').replace(/\[복제됨\]/g, '').trim(),
            구매자: item.buyerName || '',
            전화번호: item.buyerPhone || '',
            이메일: item.buyerEmail || '',
            결제일: item.paidAt ? new Date(item.paidAt).toLocaleString('ko-KR') : '',
            결제수단: KR_METHOD[method] || method || '기타',
            결제금액: displayPaidAmount,
            결제상태: KR_STATUS[pStatus] || pStatus || '대기',
            주문상태: KR_STATUS[oStatus] || oStatus || '-',
            환불금액: refundAmt,
            영수증URL: item.receiptUrl || '',
        };
    });

    // 3. 시트 생성
    const ws = XLSX.utils.json_to_sheet(rows, {
        header: [
            '강의명',
            '구매자',
            '전화번호',
            '이메일',
            '결제일',
            '결제수단',
            '결제금액',
            '결제상태',
            '주문상태',
            '환불금액',
            '영수증URL',
        ],
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '결제내역');

    const arrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([arrayBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_final_${new Date().getSeconds()}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
}
