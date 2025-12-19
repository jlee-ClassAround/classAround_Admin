'use client';

import * as React from 'react';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { dateTimeFormat, formatPrice } from '@/utils/formats';
import type { Course } from '@/generated/ivy';
import type { ColumnDef, Row, Table } from '@tanstack/react-table';
import {
    Copy,
    CopyPlusIcon,
    Edit,
    MoreHorizontal,
    Trash2,
    ListTree,
    Loader2,
    ChevronDown,
    ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    deleteCourseAction,
    deleteCoursesBulkAction,
    duplicateCourseAction,
} from '../actions/courses';
import { getChildCoursesByParentId, type ChildCourseRow } from '../actions/get-child-courses';

function TitleCell({ course }: { course: Course }) {
    const [open, setOpen] = React.useState<boolean>(false);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [children, setChildren] = React.useState<ChildCourseRow[] | null>(null);

    const toggle = async () => {
        const next = !open;
        setOpen(next);

        // 열 때만 로드 (이미 로드했다면 재호출 안 함)
        if (next && children === null) {
            setLoading(true);
            try {
                const list = await getChildCoursesByParentId(course.id);
                setChildren(Array.isArray(list) ? list : []);
            } catch {
                toast.error('하위 강의를 불러오지 못했습니다.');
                setChildren([]);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="max-w-[520px]">
            <div className="flex items-center gap-2">
                <Link href={`/ivy/courses/${course.id}`} className="hover:text-primary truncate">
                    {course.title}
                </Link>

                {/* ✅ 인라인 펼치기 버튼 */}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-7 px-2 text-xs"
                    onClick={toggle}
                >
                    {open ? (
                        <ChevronDown className="size-4 mr-1" />
                    ) : (
                        <ChevronRight className="size-4 mr-1" />
                    )}
                    하위
                </Button>
            </div>

            {/* ✅ 펼쳐진 자녀 목록 (모달 없음) */}
            {open ? (
                <div className="mt-2 pl-3 border-l space-y-1">
                    {loading ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="size-3 animate-spin" />
                            불러오는 중…
                        </div>
                    ) : (children?.length ?? 0) === 0 ? (
                        <div className="text-xs text-muted-foreground">하위 강의가 없습니다.</div>
                    ) : (
                        children!.map((c) => {
                            const price = c.discountedPrice ?? c.originalPrice ?? 0;
                            return (
                                <div key={c.id} className="flex items-center gap-2 text-xs">
                                    <span className="text-muted-foreground">•</span>

                                    <Link
                                        href={`/ivy/courses/${c.id}`}
                                        className="hover:text-primary truncate max-w-[300px]"
                                    >
                                        {c.title}
                                    </Link>

                                    <span className="ml-auto text-muted-foreground">
                                        {price ? formatPrice(price) : ''}
                                    </span>

                                    <Badge
                                        variant="secondary"
                                        className={cn(
                                            'rounded-full h-5 px-2',
                                            c.isPublished
                                                ? 'bg-green-200 text-green-600'
                                                : 'bg-gray-200 text-gray-600'
                                        )}
                                    >
                                        {c.isPublished ? '공개' : '비공개'}
                                    </Badge>
                                </div>
                            );
                        })
                    )}
                </div>
            ) : null}
        </div>
    );
}

export const columns: ColumnDef<Course>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
    },

    {
        accessorKey: 'title',
        meta: { label: '강의명' },
        header: ({ column }) => <DataTableColumnHeader column={column} title="강의명" />,
        cell: ({ row }) => <TitleCell course={row.original} />,
    },

    {
        accessorKey: 'originalPrice',
        meta: { label: '원가' },
        header: ({ column }) => <DataTableColumnHeader column={column} title="원가" />,
        cell: ({ row }) => {
            const amount = row.original.discountedPrice
                ? row.original.discountedPrice
                : row.original.originalPrice ?? 0;

            return <div>{amount ? formatPrice(amount) : ''}</div>;
        },
    },

    {
        accessorKey: 'isPublished',
        meta: { label: '상태' },
        header: ({ column }) => <DataTableColumnHeader column={column} title="상태" />,
        cell: ({ row }) => {
            const isPublished = Boolean(row.getValue('isPublished'));
            return (
                <Badge
                    variant="secondary"
                    className={cn(
                        'rounded-full',
                        isPublished ? 'bg-green-200 text-green-600' : 'bg-gray-200 text-gray-600'
                    )}
                >
                    {isPublished ? '공개' : '비공개'}
                </Badge>
            );
        },
    },

    {
        accessorKey: 'createdAt',
        meta: { label: '생성일' },
        header: ({ column }) => <DataTableColumnHeader column={column} title="생성일" />,
        cell: ({ row }) => {
            const data = dateTimeFormat(row.getValue('createdAt'));
            return <div className="text-xs truncate">{data}</div>;
        },
    },

    {
        id: 'actions',
        header: ({ table }) => <ActionHeader table={table} />,
        cell: ({ row }) => <ActionCell row={row} />,
    },
];

function ActionHeader({ table }: { table: Table<Course> }) {
    const router = useRouter();
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const [isLoading, setIsLoading] = React.useState(false);
    const selectedRowLength = selectedRows.length;

    const handleDelete = async () => {
        if (!selectedRowLength) return;

        if (
            !confirm(
                `선택한 ${selectedRowLength}개의 강의를 정말 삭제하시겠습니까? 삭제된 정보는 되돌릴 수 없습니다.`
            )
        ) {
            return;
        }

        try {
            setIsLoading(true);

            const result = await deleteCoursesBulkAction(selectedRows.map((r) => r.original.id));
            if (!result.success) {
                toast.error(result.error || '삭제 중 오류가 발생했습니다.');
                return;
            }

            table.resetRowSelection();
            router.refresh();
            toast.success(`선택한 ${selectedRowLength}개의 강의가 삭제되었습니다.`);
        } catch {
            toast.error('삭제 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-end">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="size-8 relative"
                        disabled={selectedRowLength === 0}
                    >
                        <span className="sr-only">전체 메뉴 열기</span>
                        <MoreHorizontal />
                        {selectedRowLength > 0 && (
                            <div className="absolute -top-1 -right-1 size-4 text-[11px] bg-primary rounded-full text-white aspect-square flex items-center justify-center">
                                {selectedRowLength}
                            </div>
                        )}
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>전체 설정</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled={isLoading} onClick={handleDelete}>
                        선택된 데이터 삭제
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

function ActionCell({ row }: { row: Row<Course> }) {
    const data = row.original;
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);

    const handleDelete = async () => {
        if (!confirm('정말 삭제하시겠습니까? 삭제된 강의는 되돌릴 수 없습니다.')) return;

        try {
            setIsLoading(true);
            const result = await deleteCourseAction(data.id);

            if (!result.success) {
                toast.error(result.error || '삭제 중 오류가 발생했습니다.');
                return;
            }

            router.refresh();
            toast.success('강의가 삭제되었습니다.');
        } catch {
            toast.error('삭제 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDuplicate = async (isIncludeChapters: boolean) => {
        try {
            setIsLoading(true);
            const result = await duplicateCourseAction(data.id, isIncludeChapters);

            if (!result.success) {
                toast.error(result.error || '복제 중 오류가 발생했습니다.');
                return;
            }

            router.refresh();
            toast.success('강의가 복제되었습니다.');
        } catch {
            toast.error('복제 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-end">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" disabled={isLoading} className="size-8">
                        <span className="sr-only">메뉴 열기</span>
                        <MoreHorizontal />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>설정</DropdownMenuLabel>

                    <DropdownMenuItem
                        onClick={() => {
                            navigator.clipboard.writeText(
                                `${window.location.origin}/courses/${data.id}`
                            );
                            toast.success('강의 주소가 복사되었습니다.');
                        }}
                    >
                        <Copy className="size-4 mr-2 text-muted-foreground" />
                        강의 주소 복사
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                        <Link href={`/ivy/courses/${data.id}`} className="flex items-center">
                            <Edit className="size-4 mr-2 text-muted-foreground" />
                            편집하기
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem disabled={isLoading} onClick={() => handleDuplicate(false)}>
                        <CopyPlusIcon className="size-4 mr-2 text-muted-foreground" />
                        복제
                    </DropdownMenuItem>

                    <DropdownMenuItem disabled={isLoading} onClick={() => handleDuplicate(true)}>
                        <CopyPlusIcon className="size-4 mr-2 text-muted-foreground" />
                        복제(커리큘럼 포함)
                    </DropdownMenuItem>

                    <DropdownMenuItem disabled={isLoading} onClick={handleDelete}>
                        <Trash2 className="size-4 mr-2 text-muted-foreground" />
                        삭제
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
