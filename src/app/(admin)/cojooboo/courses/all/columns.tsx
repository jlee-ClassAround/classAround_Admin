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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { dateTimeFormat, formatPrice } from '@/utils/formats';
import type { Course } from '@/generated/cojooboo';
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
    Check,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    deleteCourseAction,
    deleteCoursesBulkAction,
    duplicateCourseAction,
    getMainCoursesAction, // ✅ 추가된 액션
    updateParentIdBulkAction, // ✅ 추가된 액션
} from '../actions/courses';
import { getChildCoursesByParentId, type ChildCourseRow } from '../actions/get-child-courses';

/** ---------------------------------------------------------
 * ✅ 강의명 셀 (하위 강의 펼치기 로직 포함)
 --------------------------------------------------------- */
function TitleCell({ course }: { course: Course }) {
    const [open, setOpen] = React.useState<boolean>(false);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [children, setChildren] = React.useState<ChildCourseRow[] | null>(null);

    const toggle = async () => {
        const next = !open;
        setOpen(next);

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
                <Link
                    href={`/cojooboo/courses/${course.id}`}
                    className="hover:text-primary truncate font-medium"
                >
                    {course.title}
                </Link>

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
                                        href={`/cojooboo/courses/${c.id}`}
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
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-600'
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

/** ---------------------------------------------------------
 * ✅ 컬럼 정의
 --------------------------------------------------------- */
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
        meta: { label: '가격' },
        header: ({ column }) => <DataTableColumnHeader column={column} title="가격" />,
        cell: ({ row }) => {
            const amount = row.original.discountedPrice || row.original.originalPrice || 0;
            return <div>{amount ? formatPrice(amount) : '-'}</div>;
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
                        isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
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
            return <div className="text-xs text-muted-foreground">{data}</div>;
        },
    },
    {
        id: 'actions',
        header: ({ table }) => <ActionHeader table={table} />,
        cell: ({ row }) => <ActionCell row={row} />,
    },
];

/** ---------------------------------------------------------
 * ✅ 상단 일괄 작업 헤더 (모달 기능 포함)
 --------------------------------------------------------- */
function ActionHeader({ table }: { table: Table<Course> }) {
    const router = useRouter();
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedIds = selectedRows.map((r) => r.original.id);
    const selectedRowLength = selectedIds.length;

    const [isLoading, setIsLoading] = React.useState(false);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [mainCourses, setMainCourses] = React.useState<{ id: string; title: string }[]>([]);

    // 부모 강의 목록 불러오기 및 모달 열기
    const handleOpenParentModal = async () => {
        setIsLoading(true);
        try {
            const res = await getMainCoursesAction();
            if (res.success) {
                // 자기 자신을 부모로 정할 수 없도록 목록에서 제외
                const filtered = (res.data || []).filter((c) => !selectedIds.includes(c.id));
                setMainCourses(filtered);
                setIsModalOpen(true);
            } else {
                toast.error(res.error || '강의 목록을 불러오지 못했습니다.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // 부모 일괄 수정 실행
    const onUpdateParent = async (parentId: string | null) => {
        try {
            setIsLoading(true);
            const res = await updateParentIdBulkAction(selectedIds, parentId);
            if (res.success) {
                toast.success('부모 강의 정보가 일괄 수정되었습니다.');
                table.resetRowSelection();
                setIsModalOpen(false);
                router.refresh();
            } else {
                toast.error(res.error);
            }
        } catch {
            toast.error('오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`선택한 ${selectedRowLength}개의 강의를 삭제하시겠습니까?`)) return;
        try {
            setIsLoading(true);
            const result = await deleteCoursesBulkAction(selectedIds);
            if (!result.success) throw new Error();
            table.resetRowSelection();
            router.refresh();
            toast.success('삭제되었습니다.');
        } catch {
            toast.error('삭제 중 오류 발생');
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
                        disabled={selectedRowLength === 0 || isLoading}
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : <MoreHorizontal />}
                        {selectedRowLength > 0 && (
                            <div className="absolute -top-1 -right-1 size-4 text-[10px] bg-primary rounded-full text-white flex items-center justify-center font-bold">
                                {selectedRowLength}
                            </div>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>일괄 설정 ({selectedRowLength}개)</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleOpenParentModal}>
                        <ListTree className="size-4 mr-2" />
                        부모 강의 일괄 지정
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                        <Trash2 className="size-4 mr-2" />
                        선택 데이터 삭제
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* 🔥 부모 강의 선택 모달 */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md p-0 overflow-hidden">
                    <DialogHeader className="px-5 pt-6">
                        <DialogTitle>부모 강의 일괄 지정</DialogTitle>
                        <DialogDescription>
                            선택된 {selectedRowLength}개 강의를 아래의 강의 하위로 이동시킵니다.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-4">
                        <Command className="border rounded-md">
                            <CommandInput placeholder="메인 강의 이름 검색..." />
                            <CommandList className="max-h-[300px]">
                                <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                                <CommandGroup heading="메인 강의 목록">
                                    <CommandItem
                                        onSelect={() => onUpdateParent(null)}
                                        className="text-primary font-bold cursor-pointer"
                                    >
                                        <Check className="size-4 mr-2 opacity-0" />
                                        [부모 해제] 독립 강의로 전환
                                    </CommandItem>
                                    {mainCourses.map((c) => (
                                        <CommandItem
                                            key={c.id}
                                            onSelect={() => onUpdateParent(c.id)}
                                            className="cursor-pointer"
                                        >
                                            <Check className="size-4 mr-2 opacity-0" />
                                            {c.title}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </div>
                    <div className="bg-gray-50 px-5 py-3 flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                            취소
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

/** ---------------------------------------------------------
 * ✅ 개별 행 작업 셀
 --------------------------------------------------------- */
function ActionCell({ row }: { row: Row<Course> }) {
    const data = row.original;
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);

    const handleDelete = async () => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            setIsLoading(true);
            const result = await deleteCourseAction(data.id);
            if (!result.success) throw new Error();
            router.refresh();
            toast.success('삭제되었습니다.');
        } catch {
            toast.error('삭제 실패');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDuplicate = async (curriculum: boolean) => {
        try {
            setIsLoading(true);
            const result = await duplicateCourseAction(data.id, curriculum);
            if (result.success) {
                router.refresh();
                toast.success('복제되었습니다.');
            }
        } catch {
            toast.error('복제 실패');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-end">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" disabled={isLoading} className="size-8">
                        <MoreHorizontal className="size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>강의 설정</DropdownMenuLabel>
                    <DropdownMenuItem
                        onClick={() => {
                            navigator.clipboard.writeText(
                                `${window.location.origin}/courses/${data.id}`
                            );
                            toast.success('주소가 복사되었습니다.');
                        }}
                    >
                        <Copy className="size-4 mr-2" /> 주소 복사
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href={`/cojooboo/courses/${data.id}`}>
                            <Edit className="size-4 mr-2" /> 편집하기
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(false)}>
                        <CopyPlusIcon className="size-4 mr-2" /> 일반 복제
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(true)}>
                        <CopyPlusIcon className="size-4 mr-2" /> 커리큘럼 포함 복제
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                        <Trash2 className="size-4 mr-2" /> 삭제
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
