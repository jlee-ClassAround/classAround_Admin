'use client';

import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Category,
    Course,
    CourseOption,
    DetailImage,
    ProductBadge,
    Teacher,
} from '@/generated/ivy';
import { CircleX, ImagePlus, ImageUp, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { COURSE_DESC_MESSAGE, COURSE_TITLE_MESSAGE } from '@/constants/validate-message';
import { courseSchema, CourseSchema } from '@/lib/ivy/schemas';
import { useDetailImagesStore } from '@/store/use-detail-images';
import { useSelectTeachers } from '@/store/use-select-teachers';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getOptions } from '../actions/option-actions';
import { DetailImageUpload } from './detail-image-upload';
import { OptionAction } from './option-action';
import { TeacherCombobox } from './teacher-combobox';

import { DatePickerComponent } from '@/components/global/date-picker-component';
import { FileDropzone } from '@/components/global/file-dropzone';
import { updateCourseAction } from '../../actions/courses';

interface Props {
    course: Course & {
        detailImages: DetailImage[];
        teachers: Teacher[];
        options: CourseOption[];
        productBadge: ProductBadge[];
    };
    categories: Category[];
    teachers: Teacher[];
    productBadges: ProductBadge[];
}

export function CourseForm({ course, categories, teachers, productBadges }: Props) {
    const router = useRouter();
    const [isImageEdit, setIsImageEdit] = useState(false);
    const { images, setImages } = useDetailImagesStore();
    const { selectedTeachers, setSelectedTeachers } = useSelectTeachers();

    useEffect(() => {
        setImages(course.detailImages);
    }, [course.detailImages, setImages]);

    useEffect(() => {
        setSelectedTeachers(course.teachers);
    }, [course.teachers, setSelectedTeachers]);

    const { data: options } = useQuery({
        queryKey: ['options', course.id],
        queryFn: () => getOptions(course.id),
    });

    const form = useForm<CourseSchema>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            ...course,
            description: course.description || '',
            thumbnail: course.thumbnail || undefined,
            originalPrice: course.originalPrice ?? undefined,
            discountedPrice: course.discountedPrice ?? undefined,
            categoryId: course.categoryId || undefined,
            accessDuration: course.accessDuration || undefined,
            productBadgeIds: course.productBadge.map((badge) => badge.id),
            kakaoRoomLink: course.kakaoRoomLink || undefined,
            kakaoRoomPassword: course.kakaoRoomPassword || undefined,
        },
    });

    const { isSubmitting } = form.formState;

    const onSubmit = async (values: CourseSchema) => {
        try {
            const { productType } = form.getValues();
            if (productType === 'OPTION' && options?.length === 0) {
                toast.error('옵션을 추가해주세요.');
                return;
            }

            const processedValues = {
                ...values,
                originalPrice: values.originalPrice ?? undefined,
                discountedPrice: values.discountedPrice ?? undefined,
            };

            const result = await updateCourseAction(
                course.id,
                processedValues,
                images,
                selectedTeachers
            );

            if (!result.success) {
                toast.error(result.error ?? '처리 중 오류 발생');
                return;
            }

            toast.success('정상적으로 처리되었습니다.');
            router.refresh();
        } catch {
            toast.error('처리 중 오류가 발생했습니다.');
        }
    };

    const isUpcoming = form.watch('isUpcoming');

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* 양식 본문 */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* 양식 좌측 섹션 */}
                    <div className="space-y-4 md:col-span-3">
                        <Card className="p-6 space-y-5">
                            <div className="flex items-center border-b pb-4">
                                <h3 className="font-medium text-lg">강의 기본 정보</h3>
                            </div>

                            {/* 강의 제목 */}
                            <FormField
                                name="title"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>강의 제목</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={COURSE_TITLE_MESSAGE}
                                                disabled={isSubmitting}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* 강의 설명 */}
                            <FormField
                                name="description"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>강의 설명</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder={COURSE_DESC_MESSAGE}
                                                disabled={isSubmitting}
                                                rows={4}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* 상세페이지 이미지 */}
                            <DetailImageUpload disabled={isSubmitting} />

                            {/* 강의 수강 가능 기간 */}
                            <FormField
                                name="accessDuration"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>강의 수강 가능 기간 (일)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step={1}
                                                min={1}
                                                {...field}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                        <FormDescription>
                                            구매한 날부터 설정한 기간 후까지 강의를 수강할 수
                                            있습니다.
                                        </FormDescription>
                                    </FormItem>
                                )}
                            />
                        </Card>

                        <Card className="p-6 space-y-5">
                            {/* 할부 표기 설정 */}
                            <FormField
                                name="showInInstallment"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem className="space-y-0 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <FormLabel>할부 표기 설정</FormLabel>
                                            <FormDescription>
                                                활성화하면 12개월 할부 기준의 가격이 표기됩니다.
                                                (ex: 월 100,000원)
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* 상품 타입 */}
                            <FormField
                                name="productType"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>상품 타입</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                disabled={isSubmitting}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="상품 타입을 선택해주세요." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="SIMPLE">
                                                        단일 상품
                                                    </SelectItem>
                                                    <SelectItem value="OPTION">
                                                        옵션 상품
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {form.watch('productType') === 'SIMPLE' ? (
                                <>
                                    {/* 원가 */}
                                    <FormField
                                        name="originalPrice"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>강의 가격</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        placeholder="가격을 입력해주세요."
                                                        disabled={isSubmitting}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* 할인가 */}
                                    <FormField
                                        name="discountedPrice"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>할인가</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        placeholder="할인가를 입력해주세요."
                                                        disabled={isSubmitting}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* 세금 설정 */}
                                    <FormField
                                        name="isTaxFree"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem className="space-y-0 flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <FormLabel>세금 설정</FormLabel>
                                                    <FormDescription>
                                                        활성화하면 면세 상품으로 처리됩니다.
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        disabled={isSubmitting}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            ) : (
                                <OptionAction courseId={course.id} />
                            )}
                        </Card>
                    </div>

                    {/* 양식 우측 섹션 */}
                    <div className="md:col-span-2 space-y-4">
                        <Card className="p-6 space-y-6">
                            <div className="flex items-center gap-4 justify-end border-b pb-5">
                                {/* 강의 공개 설정 */}
                                <FormField
                                    name="isPublished"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem className="flex items-center gap-2 space-y-0">
                                            <div
                                                className={cn(
                                                    'text-xs font-medium',
                                                    field.value ? 'text-primary' : 'text-slate-400'
                                                )}
                                            >
                                                {field.value ? '공개' : '비공개'}
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    disabled={isSubmitting}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                {/* 저장하기 */}
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            저장중 <Loader2 className="animate-spin" />
                                        </>
                                    ) : (
                                        <>저장</>
                                    )}
                                </Button>
                            </div>

                            {/* 대표이미지 */}
                            <FormField
                                name="thumbnail"
                                control={form.control}
                                render={({ field: { onChange, value } }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel>강의 대표이미지</FormLabel>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                disabled={isSubmitting}
                                                onClick={() => setIsImageEdit((c) => !c)}
                                                className="text-slate-600"
                                            >
                                                {isImageEdit ? (
                                                    <>
                                                        <CircleX />
                                                        취소
                                                    </>
                                                ) : value ? (
                                                    <>
                                                        <ImageUp />
                                                        이미지 변경
                                                    </>
                                                ) : (
                                                    <>
                                                        <ImagePlus />
                                                        이미지 업로드
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                        {isImageEdit ? (
                                            <FormControl>
                                                <FileDropzone
                                                    bucket="images"
                                                    setState={() => setIsImageEdit(false)}
                                                    onChange={onChange}
                                                    className="aspect-video"
                                                />
                                            </FormControl>
                                        ) : (
                                            <div className="relative w-full aspect-video border rounded-md overflow-hidden">
                                                {value ? (
                                                    <Image
                                                        fill
                                                        src={value}
                                                        alt="강의 대표이미지"
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                        <ImageUp className="size-8 text-slate-400" />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <FormMessage />
                                        <FormDescription>
                                            16:9 비율의 이미지를 업로드해주세요.
                                        </FormDescription>
                                        <FormDescription>
                                            이미지의 용량은 1MB가 넘지 않는 것이 추천됩니다.
                                        </FormDescription>
                                    </FormItem>
                                )}
                            />

                            {/* 카테고리 */}
                            <FormField
                                name="categoryId"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem className="flex flex-col gap-1">
                                        <FormLabel>카테고리</FormLabel>
                                        <FormControl>
                                            <Combobox
                                                options={categories.map((cat) => ({
                                                    label: cat.name,
                                                    value: cat.id,
                                                }))}
                                                disabled={isSubmitting}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* 강사 선택 */}
                            <div>
                                <div className="text-sm font-medium mb-2">강사 선택</div>
                                <TeacherCombobox
                                    teachers={teachers.map((teacher) => ({
                                        id: teacher.id,
                                        name: teacher.name,
                                    }))}
                                    disabled={isSubmitting}
                                />
                            </div>

                            {/* 배지 선택 */}
                            <FormField
                                name="productBadgeIds"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>배지 선택</FormLabel>
                                        <div className="flex flex-wrap gap-2">
                                            {productBadges.map((badge) => {
                                                const isSelected = field.value?.includes(badge.id);
                                                return (
                                                    <Badge
                                                        key={badge.id}
                                                        variant={isSelected ? 'default' : 'outline'}
                                                        className="cursor-pointer"
                                                        style={{
                                                            backgroundColor: isSelected
                                                                ? badge.color || '#000000'
                                                                : 'transparent',
                                                            color: isSelected
                                                                ? badge.textColor || '#ffffff'
                                                                : undefined,
                                                            borderColor: badge.color || '#000000',
                                                        }}
                                                        onClick={() => {
                                                            const newValue = isSelected
                                                                ? field.value?.filter(
                                                                      (id) => id !== badge.id
                                                                  )
                                                                : [
                                                                      ...(field.value || []),
                                                                      badge.id,
                                                                  ];
                                                            field.onChange(newValue);
                                                        }}
                                                    >
                                                        {badge.name}
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </Card>

                        <Card className="p-6 space-y-6">
                            {/* 신청 마감 설정 */}
                            <FormField
                                name="isUpcoming"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem className="space-y-0 flex items-center justify-between gap-x-5">
                                        <div className="space-y-1">
                                            <FormLabel>신청마감 설정</FormLabel>
                                            <FormDescription>
                                                체크하면 마감일을 지정할 수 있습니다.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* 마감일 선택 */}
                            <FormField
                                name="endDate"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem className="flex flex-col gap-2">
                                        <FormLabel
                                            className={cn(
                                                !isUpcoming && 'text-gray-400 select-none'
                                            )}
                                        >
                                            신청 마감시간
                                        </FormLabel>
                                        <FormControl>
                                            <DatePickerComponent
                                                value={field.value}
                                                onChange={field.onChange}
                                                disabled={!isUpcoming || isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                        <FormDescription
                                            className={cn(
                                                !isUpcoming && 'text-gray-300 select-none'
                                            )}
                                        >
                                            마감일을 선택하면 유저화면에서 카운트다운이 나오게
                                            됩니다.
                                        </FormDescription>
                                    </FormItem>
                                )}
                            />
                        </Card>

                        <Card className="p-6 space-y-6">
                            <FormField
                                name="kakaoRoomLink"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>카카오톡 링크</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="카카오톡 링크를 입력해주세요."
                                                disabled={isSubmitting}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                        <FormDescription>
                                            결제완료시 고객에게 안내됩니다.
                                        </FormDescription>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="kakaoRoomPassword"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>카카오톡 입장코드</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="카카오톡 입장코드를 입력해주세요."
                                                disabled={isSubmitting}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                        <FormDescription>
                                            결제완료시 고객에게 안내됩니다.
                                        </FormDescription>
                                    </FormItem>
                                )}
                            />
                        </Card>

                        <Card className="p-6 space-y-6">
                            {/* 숨김 설정 */}
                            <FormField
                                name="isHidden"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem className="space-y-0 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <FormLabel>숨김 설정</FormLabel>
                                            <FormDescription>
                                                활성화하면 강의가 숨겨집니다. 링크를 통해서는 접속할
                                                수 있습니다.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </Card>
                    </div>
                </div>
            </form>
        </Form>
    );
}
