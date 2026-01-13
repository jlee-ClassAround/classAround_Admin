export function downloadCSV(data: any[], filename: string) {
    const sortedData = [...data].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateA - dateB; // 오름차순 (과거 -> 현재)
    });

    const headers = [
        '주문명',
        '상품명',
        '구매자',
        '전화번호',
        '이메일',
        '상품유형',
        '결제금액',
        '결제상태',
        '면세여부',
        '결제일',
        '환불금액',
        '환불일',
    ];

    const formatToSortableDate = (dateInput: any) => {
        if (!dateInput) return '';
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return '';

        const pad = (n: number) => (n < 10 ? `0${n}` : n);

        const year = d.getFullYear();
        const month = pad(d.getMonth() + 1);
        const day = pad(d.getDate());
        const hours = pad(d.getHours());
        const minutes = pad(d.getMinutes());
        const seconds = pad(d.getSeconds());

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const csvData = sortedData.map((item) => {
        const cleanText = (text: any) => String(text ?? '').replace(/,/g, '');

        return [
            cleanText(item.orderName),
            cleanText(item.productTitle),
            cleanText(item.user?.username),
            cleanText(item.user?.phone),
            cleanText(item.user?.email),
            item.productType === 'COURSE' ? '강의' : '전자책',
            item.finalPrice,
            item.paymentStatus === 'COMPLETED'
                ? '결제완료'
                : item.paymentStatus === 'REFUNDED'
                ? '환불됨'
                : item.paymentStatus === 'PARTIAL_REFUNDED'
                ? '부분환불'
                : '취소됨',
            item.isTaxFree ? '면세' : '과세',
            formatToSortableDate(item.createdAt), // 결제일
            item.cancelAmount || 0,
            formatToSortableDate(item.canceledAt), // 환불일
        ];
    });

    const csvContent = [headers.join(','), ...csvData.map((row) => row.join(','))].join('\n');

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
    window.URL.revokeObjectURL(url); // 메모리 해제
}
