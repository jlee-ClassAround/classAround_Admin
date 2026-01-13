'use client';

import { EnrolledUser } from '@/app/(admin)/cojooboo/_actions/users/get-enrolled-users';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { dateFormat } from '@/utils/formats';
import { ColumnDef, Row, Table } from '@tanstack/react-table';
import { Edit, Loader2, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { sendKakaoMessageAction } from '../actions/send-kakao-message';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { updateEnrollmentRoleAction } from './_actions/update-enrollment-role';

export const columns: ColumnDef<EnrolledUser>[] = [
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
        accessorKey: 'username',
        meta: {
            label: '이름',
        },
        header: ({ column }) => <DataTableColumnHeader column={column} title="이름" />,
        cell: ({ row }) => {
            const data = row.original;

            return (
                <div className="max-w-[300px] truncate">
                    <Link href={`/cojooboo/users/${data.id}`} className="hover:text-primary">
                        {data.username}
                    </Link>
                </div>
            );
        },
    },
    {
        accessorKey: 'email',
        meta: {
            label: '이메일',
        },
        header: ({ column }) => <DataTableColumnHeader column={column} title="이메일" />,
        cell: ({ row }) => row.original.email,
    },

    {
        accessorKey: 'phone',
        meta: {
            label: '연락처',
        },
        header: ({ column }) => <DataTableColumnHeader column={column} title="연락처" />,
        cell: ({ row }) => row.original.phone,
    },

    {
        accessorKey: 'progress',
        meta: {
            label: '진행률',
        },
        header: ({ column }) => <DataTableColumnHeader column={column} title="진행률" />,
        cell: ({ row }) => {
            const progress = row.original.progress;
            return (
                <div className="flex items-center gap-x-2">
                    <span className="text-xs font-medium">{progress}%</span>
                    <Progress value={progress} className="w-[100px]" />
                </div>
            );
        },
    },
    {
        accessorKey: 'courseOption.name',
        meta: {
            label: '옵션',
        },
        header: ({ column }) => <DataTableColumnHeader column={column} title="강의옵션" />,
        cell: ({ row }) => {
            const data = row.original.courseOption;
            return <div className="text-xs text-muted-foreground">{data?.name || '없음'}</div>;
        },
    },
    {
        accessorKey: 'isActive',
        meta: {
            label: '활성상태',
        },
        header: ({ column }) => <DataTableColumnHeader column={column} title="활성상태" />,
        cell: ({ row }) => {
            const data = row.original;
            return <Badge variant="secondary">{data.isActive ? '활성' : '비활성'}</Badge>;
        },
    },
    {
        accessorKey: 'endDate',
        meta: {
            label: '만료일자',
        },
        header: ({ column }) => <DataTableColumnHeader column={column} title="만료일자" />,
        cell: ({ row }) => {
            const data = row.original.endDate;
            return (
                <div className="text-xs text-muted-foreground">
                    {data ? dateFormat(data) : '무제한'}
                </div>
            );
        },
    },
    {
        accessorKey: 'role',
        meta: {
            label: '권한설정',
        },
        header: ({ column }) => <DataTableColumnHeader column={column} title="스탭등록" />,
        cell: ({ row }) => {
            const data = row.original;

            const handleRoleChange = async (value: string) => {
                const newRole = value === 'student' ? null : 'manager';

                // 💡 서버 액션 호출 시 data.enrollmentId 사용
                const result = await updateEnrollmentRoleAction(data.enrollmentId, newRole);

                if (result.success) {
                    toast.success('권한이 변경되었습니다.');
                }
            };

            return (
                <Select
                    defaultValue={data.role === 'manager' ? 'manager' : 'student'}
                    onValueChange={handleRoleChange}
                >
                    <SelectTrigger className="w-[100px] h-8 text-xs">
                        <SelectValue placeholder="권한 선택" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="student">수강생</SelectItem>
                        <SelectItem value="manager">스탭</SelectItem>
                    </SelectContent>
                </Select>
            );
        },
    },
    {
        id: 'actions',
        size: 20,
        header: ({ table }) => <ActionHeader table={table} />,
        cell: ({ row }) => <ActionCell row={row} />,
    },
];

function ActionHeader({ table }: { table: Table<EnrolledUser> }) {
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [templateId, setTemplateId] = useState('');

    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedRowLength = table.getFilteredSelectedRowModel().rows.length;
    const userDatas = selectedRows.map((row) => row.original);

    const handleSendKakaoMessage = async () => {
        try {
            if (!templateId) {
                toast.error('템플릿 ID를 입력해주세요.');
                return;
            }

            setIsLoading(true);

            const result = await sendKakaoMessageAction({
                templateId,
                sendDatas: userDatas.map((user: any) => ({
                    to: user.phone!,
                    username: user.username,
                })),
            });

            if (!result.success) {
                toast.error(result.error ?? '오류가 발생했습니다.');
                return;
            }

            toast.success('알림톡 발송 요청 완료');
            setOpen(false);
        } catch (error) {
            toast.error('오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
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
                        <DropdownMenuItem disabled={true} onClick={() => {}}>
                            이메일 보내기 {'(준비중)'}
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={isLoading} onClick={() => setOpen(true)}>
                            카카오 알림톡 보내기
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>알림톡 보내기</DialogTitle>
                        <DialogDescription>
                            선택한 학생들에게 알림톡을 보내시겠습니까?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-y-2">
                        <Label>템플릿 ID</Label>
                        <Input value={templateId} onChange={(e) => setTemplateId(e.target.value)} />
                        <p className="text-xs text-muted-foreground">
                            템플릿 ID는 카카오 알림톡 템플릿 페이지에서 확인할 수 있습니다. 잘못
                            입력할 경우 발송되지 않습니다.
                            {'(솔라피 링크: https://console.solapi.com/kakao/templates)'}
                        </p>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">취소</Button>
                        </DialogClose>

                        <Button disabled={isLoading} onClick={handleSendKakaoMessage}>
                            {isLoading ? <Loader2 className="size-4 animate-spin" /> : '보내기'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function ActionCell({ row }: { row: Row<EnrolledUser> }) {
    const data = row.original;
    return (
        <div className="flex justify-end">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="size-8">
                        <span className="sr-only">메뉴 열기</span>
                        <MoreHorizontal />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>설정</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <Link href={`/cojooboo/users/${data.id}`} className="flex items-center">
                            <Edit className="size-4 mr-2 text-muted-foreground" />
                            상세보기
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
