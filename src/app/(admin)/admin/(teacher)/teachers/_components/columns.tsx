'use client';

import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { dateTimeFormat } from '@/utils/formats';
import { ColumnDef } from '@tanstack/react-table';
import { User as UserIcon, Loader2, ImageIcon, Quote } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Teacher } from '@/generated/classaround';
import { getBrandTeachers, updateTeacherAction } from '../actions';

const BRANDS = ['cojooboo', 'ivy'];

// ✅ HTML 태그를 제거하는 유틸리티 함수
function stripHtml(html: string | null): string {
    if (!html) return '등록된 프로필 소개글이 없습니다.';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

export const columns: ColumnDef<Teacher>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
            />
        ),
    },
    {
        accessorKey: 'username',
        header: ({ column }) => <DataTableColumnHeader column={column} title="신청자명" />,
        cell: ({ row }) => (
            <div className="flex items-center gap-2 font-medium text-sm">
                <UserIcon className="size-4 text-muted-foreground" />
                {row.original.username}
            </div>
        ),
    },
    {
        accessorKey: 'brand',
        header: ({ column }) => <DataTableColumnHeader column={column} title="연동 브랜드" />,
        cell: ({ row }) => <BrandCell teacher={row.original} />,
    },
    {
        accessorKey: 'tId',
        header: ({ column }) => <DataTableColumnHeader column={column} title="매핑 강사 선택" />,
        cell: ({ row }) => <TeacherMappingCell teacher={row.original} />,
    },
    {
        accessorKey: 'email',
        header: ({ column }) => <DataTableColumnHeader column={column} title="이메일" />,
        cell: ({ row }) => <div className="text-sm">{row.original.email}</div>,
    },
    {
        accessorKey: 'createdAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="등록일" />,
        cell: ({ row }) => (
            <div className="text-xs text-muted-foreground">
                {dateTimeFormat(row.getValue('createdAt'))}
            </div>
        ),
    },
];

function BrandCell({ teacher }: { teacher: Teacher }) {
    const router = useRouter();
    const [isUpdating, setIsUpdating] = useState(false);

    const handleBrandChange = async (newBrand: string) => {
        setIsUpdating(true);
        const res = await updateTeacherAction(teacher.id, {
            brand: newBrand,
            tId: '',
            nickname: '',
        });
        if (res.success) {
            toast.success(`${newBrand} 브랜드로 변경되었습니다.`);
            router.refresh();
        }
        setIsUpdating(false);
    };

    return (
        <Select
            defaultValue={teacher.brand || ''}
            onValueChange={handleBrandChange}
            disabled={isUpdating}
        >
            <SelectTrigger className="w-[110px] h-8 text-xs">
                {isUpdating ? <Loader2 className="size-3 animate-spin mr-2" /> : null}
                <SelectValue placeholder="선택" />
            </SelectTrigger>
            <SelectContent>
                {BRANDS.map((b) => (
                    <SelectItem key={b} value={b}>
                        {b}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

function TeacherMappingCell({ teacher }: { teacher: Teacher }) {
    const router = useRouter();
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [options, setOptions] = useState<
        { id: string; name: string; profile: string | null; info: string | null }[]
    >([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [hoveredTeacher, setHoveredTeacher] = useState<{
        id: string;
        name: string;
        profile: string | null;
        info: string | null;
    } | null>(null);
    const [previewTop, setPreviewTop] = useState(0);

    useEffect(() => {
        if (teacher.brand) {
            setIsLoading(true);
            getBrandTeachers(teacher.brand).then((data: any) => {
                setOptions(data);
                setIsLoading(false);
            });
        }
    }, [teacher.brand]);

    const handleOpenChange = (open: boolean) => {
        if (open && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPreviewTop(rect.top + window.scrollY - 20);
        } else {
            setHoveredTeacher(null);
        }
    };

    const handleTeacherChange = async (tId: string) => {
        if (tId === 'none') return;
        const selectedTeacher = options.find((o) => o.id === tId);
        setIsUpdating(true);
        const res = await updateTeacherAction(teacher.id, {
            tId,
            nickname: selectedTeacher?.name || '',
        });
        if (res.success) {
            toast.success('매핑 완료');
            router.refresh();
        }
        setIsUpdating(false);
    };

    if (!teacher.brand)
        return (
            <span className="text-[10px] text-muted-foreground/50 pl-2 italic">브랜드 미지정</span>
        );

    return (
        <>
            <Select
                value={teacher.tId || 'none'}
                onValueChange={handleTeacherChange}
                onOpenChange={handleOpenChange}
                disabled={isLoading || isUpdating}
            >
                <SelectTrigger ref={triggerRef} className="w-[170px] h-10 shrink-0">
                    {isLoading || isUpdating ? (
                        <Loader2 className="size-3 animate-spin mr-2" />
                    ) : null}
                    <SelectValue placeholder="강사 선택" />
                </SelectTrigger>

                <SelectContent
                    className="max-h-[400px] overflow-y-auto"
                    onMouseLeave={() => setHoveredTeacher(null)}
                >
                    <SelectItem value="none" disabled>
                        선택하세요
                    </SelectItem>
                    {options.map((opt) => (
                        <SelectItem
                            key={opt.id}
                            value={opt.id}
                            onPointerEnter={() => setHoveredTeacher(opt)}
                        >
                            <div className="flex items-center gap-3 py-1">
                                <Avatar className="size-8 border shrink-0">
                                    <AvatarImage src={opt.profile || ''} className="object-cover" />
                                    <AvatarFallback>
                                        <UserIcon className="size-4" />
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-semibold">{opt.name}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {hoveredTeacher && (
                <div
                    className="fixed z-[9999] bg-white border-2 border-primary/40 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.4)] overflow-hidden pointer-events-none animate-in fade-in slide-in-from-left-6 duration-300"
                    style={{
                        width: '340px',
                        left: triggerRef.current
                            ? triggerRef.current.getBoundingClientRect().left + 420
                            : '50%',
                        top: previewTop,
                    }}
                >
                    <div className="relative aspect-square w-full bg-muted">
                        {hoveredTeacher.profile ? (
                            <img
                                src={hoveredTeacher.profile}
                                alt={hoveredTeacher.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-muted">
                                <ImageIcon className="size-16 text-muted-foreground/20" />
                            </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/30 to-transparent p-5">
                            <p className="text-2xl font-black text-white tracking-tighter">
                                {hoveredTeacher.name}
                            </p>
                            <span className="inline-block mt-1 text-[10px] bg-primary px-2 py-0.5 rounded text-primary-foreground font-bold uppercase">
                                {teacher.brand} INSTRUCTOR
                            </span>
                        </div>
                    </div>

                    <div className="p-5 bg-white space-y-3">
                        <div className="flex items-start gap-2 text-primary/60">
                            <Quote className="size-4 rotate-180 shrink-0" />
                            {/* ✅ stripHtml 함수를 사용하여 HTML 태그를 제거하고 순수 텍스트만 출력 */}
                            <p className="text-sm font-medium leading-relaxed text-slate-700 line-clamp-4 italic break-keep">
                                {stripHtml(hoveredTeacher.info)}
                            </p>
                        </div>
                        <div className="pt-2 border-t flex justify-between items-center">
                            <span className="text-[10px] text-muted-foreground font-mono">
                                UID: {hoveredTeacher.id.split('-')[0]}...
                            </span>
                            <span className="text-[10px] text-primary font-bold">
                                PROFILE VERIFIED
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
