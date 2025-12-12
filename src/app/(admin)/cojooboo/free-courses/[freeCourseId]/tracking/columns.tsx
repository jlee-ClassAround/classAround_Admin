'use client';

import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { dateFormat } from '@/utils/formats';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';

export interface TrackingRow {
    id: string;
    parameterName: string;
    publishedAt: Date | null;
    createdAt: Date;
    mediumName: string | null;
    merchantName: string | null;
}

export const columns: ColumnDef<TrackingRow>[] = [
    {
        accessorKey: 'mediumName',
        meta: { label: '광고매체' },
        header: ({ column }) => <DataTableColumnHeader column={column} title="광고매체" />,
        cell: ({ row }) => row.original.mediumName || '-',
    },
    {
        accessorKey: 'merchantName',
        meta: { label: '광고소재' },
        header: ({ column }) => <DataTableColumnHeader column={column} title="광고소재" />,
        cell: ({ row }) => row.original.merchantName || '-',
    },
    {
        accessorKey: 'parameterName',
        meta: { label: '트래킹코드' },
        header: ({ column }) => <DataTableColumnHeader column={column} title="트래킹코드" />,
        cell: ({ row }) => row.original.parameterName,
    },
    {
        accessorKey: 'createdAt',
        meta: { label: '트래킹URL 발급일' },
        header: ({ column }) => <DataTableColumnHeader column={column} title="트래킹URL 발급일" />,
        cell: ({ row }) => (
            <div className="text-sm truncate">{dateFormat(row.original.createdAt)}</div>
        ),
    },
    {
        accessorKey: 'publishedAt',
        meta: { label: '유튜브 등록일자' },
        header: ({ column }) => <DataTableColumnHeader column={column} title="유튜브등록일자" />,
        cell: ({ row }) => {
            const published = row.original.publishedAt;
            return (
                <div className="text-sm truncate">{published ? dateFormat(published) : '-'}</div>
            );
        },
    },
    {
        id: 'actions',
        meta: { label: '관리' },
        header: ({ column }) => <DataTableColumnHeader column={column} title="관리" />,
        cell: ({ row }) => {
            const item = row.original;

            const isSystemMedium = item.mediumName === '메타' || item.mediumName === '구글';

            return (
                <div className="flex items-center gap-2">
                    {/* 메타/구글은 수정버튼 감춤 */}
                    {!isSystemMedium && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                // 모달 열기
                                window.dispatchEvent(
                                    new CustomEvent('open-youtube-modal', {
                                        detail: { trackingId: item.id },
                                    })
                                );
                            }}
                        >
                            <Pencil className="w-4 h-4 mr-1" /> 유튜브링크 등록
                        </Button>
                    )}
                </div>
            );
        },
    },
];
