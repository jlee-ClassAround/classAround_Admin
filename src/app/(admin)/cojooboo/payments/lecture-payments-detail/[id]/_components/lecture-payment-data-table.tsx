'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import Link from 'next/link';

import { DetailDataTable } from './lecture-payment-detail-table';

import { columns } from '../columns';
import { SearchInput } from './data-components/search-input';
import { StatusFilter } from './data-components/status-filter';
import { TypeFilter } from './data-components/type-filter';

import { TossCourseRepairButton } from './payment-sync-button';
import { LecturePaymentDetailRow } from '../actions';
import { downloadLecturePaymentsXLSX } from '../_actions/download-xlsx';
import { CashPaymentUploadModal } from './cash-payment-upload-modal';

interface LecturePaymentDetailDataTableProps {
    data: LecturePaymentDetailRow[];
}

export function LecturePaymentDetailDataTable({
    data,
}: // courseOptions,
LecturePaymentDetailDataTableProps) {
    /** -------------------------------
     * 🔥 1) 로컬 전용 필터 state
     -------------------------------- */
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('ALL');
    const [type, setType] = useState('ALL');
    const [course, setCourse] = useState<string | null>(null);
    const courseId = data?.[0]?.courseId;

    /** -------------------------------
     * 🔥 2) 필터링된 data 계산
     -------------------------------- */
    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const searchLower = search.toLowerCase();

            const matchesSearch =
                search === '' ||
                item.courseTitle?.toLowerCase().includes(searchLower) ||
                item.buyerName?.toLowerCase().includes(searchLower) ||
                item.buyerPhone?.includes(searchLower);

            const matchesStatus = status === 'ALL' || item.paymentStatus === status;

            const paymentMethod = type === 'ALL' || item.paymentMethod === type;

            const matchesCourse = course === null || item.courseId === course;

            return matchesSearch && matchesStatus && paymentMethod && matchesCourse;
        });
    }, [data, search, status, type, course]);

    /** -------------------------------
     * 🔥 3) CSV 다운로드
     -------------------------------- */
    const handleDownloadCSV = () => {
        const filename = `payment-history-${new Date().toISOString().split('T')[0]}`;
        downloadLecturePaymentsXLSX(filteredData, filename);
    };

    /** -------------------------------
     * 🔥 4) 필터 초기화
     -------------------------------- */
    const resetFilters = () => {
        setSearch('');
        setStatus('ALL');
        setType('ALL');
        setCourse(null);
    };

    return (
        <div className="space-y-4">
            {/* 상단 버튼 그룹 */}
            <div className="flex justify-between gap-4 flex-wrap">
                <Button asChild>
                    <Link href="/cojooboo/payments/lecture-payments/2025">목록으로</Link>
                </Button>
                <div className="flex justify-between gap-4 flex-wrap">
                    <TossCourseRepairButton courseId={courseId} dryRun={false} />
                </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
                {/* 왼쪽 그룹: 검색 및 필터 */}
                <SearchInput onChange={setSearch} value={search} />
                <TypeFilter value={type} onChange={setType} />
                <StatusFilter value={status} onChange={setStatus} />

                <Button variant="outline" onClick={resetFilters}>
                    필터 삭제
                </Button>

                {/* 오른쪽 그룹: 업로드 및 내보내기 버튼 (ml-auto로 우측 밀착) */}
                <div className="ml-auto flex items-center gap-2">
                    {courseId && <CashPaymentUploadModal courseId={courseId} />}
                    <Button onClick={handleDownloadCSV} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        XLSX 내보내기
                    </Button>
                </div>
            </div>

            {/* 데이터 테이블 */}
            <DetailDataTable columns={columns} data={filteredData} noSearch defaultPageSize={50} />
        </div>
    );
}
