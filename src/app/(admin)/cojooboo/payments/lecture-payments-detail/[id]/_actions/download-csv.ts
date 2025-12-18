export function downloadCSV(data: any[], filename: string) {
    // CSV 헤더 생성
    const headers = [
        '주문명',
        '상품명',
        '구매자',
        '전화번호',
        '가입일',
        '이메일',
        '상품유형',
        '결제금액',
        '결제상태',
        '면세여부',
        '결제일',
        '환불금액',
        '환불일',
    ];

    // CSV 데이터 생성
    const csvData = data.map((item) => [
        item.orderName,
        item.productTitle,
        item.user?.username,
        item.user?.phone,
        new Date(item.user?.createdAt).toLocaleString('ko-KR'),
        item.user?.email,
        item.productType === 'COURSE' ? '강의' : '전자책',
        item.finalPrice,
        item.paymentStatus === 'COMPLETED'
            ? '결제완료'
            : item.paymentStatus === 'REFUNDED'
            ? '환불됨'
            : item.paymentStatus === 'PARTIAL_REFUNDED'
            ? '부분환불'
            : item.paymentStatus === 'WAITING_FOR_DEPOSIT'
            ? '결제대기'
            : '취소됨',
        item.isTaxFree ? '면세' : '과세',
        new Date(item.createdAt).toLocaleString('ko-KR'),
        item.cancelAmount,
        item.canceledAt ? new Date(item.canceledAt).toLocaleString() : '',
    ]);

    // CSV 문자열 생성
    const csvContent = [headers.join(','), ...csvData.map((row) => row.join(','))].join('\n');

    // CSV 파일 다운로드
    const blob = new Blob(['\uFEFF' + csvContent], {
        type: 'text/csv;charset=utf-8',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
