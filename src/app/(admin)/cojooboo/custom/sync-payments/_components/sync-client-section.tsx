'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { AlertCircle, Loader2, RefreshCw, Database, Check, ChevronsUpDown } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { syncPaymentsByCourseAction } from '../actions';

interface Course {
    id: string;
    title: string;
}

export default function SyncClientSection({ courses }: { courses: Course[] }) {
    const [open, setOpen] = useState(false); // Popover 열림 상태
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // 선택된 강의의 제목을 찾기 위한 헬퍼
    const selectedCourseTitle = courses.find((course) => course.id === selectedCourseId)?.title;

    const handleSync = async () => {
        if (!selectedCourseId) return toast.error('보정할 강의를 선택해주세요.');

        const isConfirmed = confirm(
            '⚠️ 주의: 선택한 강의의 기존 주문/결제 내역이 삭제된 후 다시 생성됩니다.\n정말 진행하시겠습니까?'
        );
        if (!isConfirmed) return;

        setLoading(true);
        try {
            const result = await syncPaymentsByCourseAction(selectedCourseId);
            if (result.success) {
                toast.success(`${result.count}건의 결제 데이터가 보정되었습니다.`);
            } else {
                toast.error(result.message || '동기화 중 오류가 발생했습니다.');
            }
        } catch (e) {
            toast.error('서버 통신 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid gap-6">
            <Alert
                variant="destructive"
                className="max-w-3xl bg-destructive/5 border-destructive/20"
            >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>데이터 무결성 주의</AlertTitle>
                <AlertDescription>
                    이 작업은 선택된 강의와 관련된 기존 <strong>Order, OrderItem, Payment</strong>{' '}
                    데이터를 완전히 삭제한 후 <strong>TossCustomer</strong> 원천 데이터를 기반으로
                    재생성합니다.
                </AlertDescription>
            </Alert>

            <Card className="max-w-3xl shadow-md">
                <CardHeader className="border-b bg-muted/30">
                    <div className="flex items-center gap-2">
                        <Database className="size-5 text-primary" />
                        <CardTitle>보정 대상 설정</CardTitle>
                    </div>
                    <CardDescription>
                        강의를 검색하여 선택하면 해당 강의의 결제 이력을 재구성합니다.
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                    <div className="space-y-2 flex flex-col">
                        <label className="text-sm font-semibold text-foreground/70">
                            대상 강의 검색 및 선택
                        </label>

                        {/* ✅ Combobox 패턴 적용 */}
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between h-11 bg-white font-normal"
                                    disabled={loading}
                                >
                                    {selectedCourseId
                                        ? selectedCourseTitle
                                        : '강의 제목을 입력하여 검색하세요...'}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-[var(--radix-popover-trigger-width)] p-0"
                                align="start"
                            >
                                <Command>
                                    <CommandInput placeholder="강의 제목 검색..." />
                                    <CommandList>
                                        <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                                        <CommandGroup>
                                            {courses.map((course) => (
                                                <CommandItem
                                                    key={course.id}
                                                    value={course.title} // 검색 대상
                                                    onSelect={() => {
                                                        setSelectedCourseId(course.id);
                                                        setOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            'mr-2 h-4 w-4',
                                                            selectedCourseId === course.id
                                                                ? 'opacity-100'
                                                                : 'opacity-0'
                                                        )}
                                                    />
                                                    {course.title}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardContent>

                <CardFooter className="border-t bg-muted/10 pt-4 flex justify-end">
                    <Button
                        onClick={handleSync}
                        disabled={loading || !selectedCourseId}
                        size="lg"
                        className="min-w-[160px]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                처리 중...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                데이터 보정 시작
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
