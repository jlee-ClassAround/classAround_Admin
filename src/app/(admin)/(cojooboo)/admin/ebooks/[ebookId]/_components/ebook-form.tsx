"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category, DetailImage, Ebook, ProductBadge } from "@prisma/client";
import {
  CircleX,
  FilePlus,
  FileText,
  ImagePlus,
  ImageUp,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { DatePickerComponent } from "@/components/common/date-picker-component";
import { FileDropzone } from "@/components/common/file-dropzone";
import { Card } from "@/components/ui/card";
import { ebookSchema, EbookSchema } from "@/validations/schemas";
import { useDetailImagesStore } from "@/store/use-detail-images";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DetailImageUpload } from "../../../courses/[courseId]/_components/detail-image-upload";
import { Combobox } from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";
interface Props {
  ebook: Ebook & {
    detailImages: DetailImage[];
    productBadge: ProductBadge[];
  };
  categories: Category[];
  productBadges: ProductBadge[];
}

export function EbookForm({ ebook, categories, productBadges }: Props) {
  const router = useRouter();
  const [isImageEdit, setIsImageEdit] = useState(false);
  const [isFileEditting, setIsFileEditting] = useState(false);
  const { images, setImages } = useDetailImagesStore();

  useEffect(() => {
    if (ebook?.detailImages) {
      setImages(ebook?.detailImages || []);
    }
  }, [ebook?.detailImages, setImages]);

  const form = useForm<EbookSchema>({
    resolver: zodResolver(ebookSchema),
    defaultValues: {
      ...ebook,
      description: ebook?.description || "",
      thumbnail: ebook?.thumbnail || "",
      originalPrice: ebook?.originalPrice ?? undefined,
      discountedPrice: ebook?.discountedPrice ?? undefined,
      endDate: ebook?.endDate ?? undefined,
      fileUrl: ebook?.fileUrl || "",
      productBadgeIds: ebook?.productBadge.map((badge) => badge.id) || [],
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: EbookSchema) => {
    try {
      const processedValues = {
        ...values,
        discountedPrice: values.discountedPrice ?? null,
      };

      await axios.patch(`/api/ebooks/${ebook.id}`, {
        values: processedValues,
        images,
      });

      toast.success("정상적으로 처리되었습니다.");
      router.push("/admin/ebooks/all");
      router.refresh();
    } catch {
      toast.error("처리 중 오류가 발생했습니다.");
    }
  };

  const isUpcoming = form.watch("isUpcoming");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* 양식 본문 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* 양식 좌측 섹션 */}
          <div className="space-y-4 md:col-span-3">
            <Card className="p-6 space-y-5">
              <div className="flex items-center border-b pb-4">
                <h3 className="font-medium text-lg">전자책 기본 정보</h3>
              </div>

              {/* 전자책 제목 */}
              <FormField
                name="title"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>전자책 제목</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="전자책 제목을 입력해주세요."
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 전자책 설명 */}
              <FormField
                name="description"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>전자책 설명</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="전자책 설명을 입력해주세요."
                        disabled={isSubmitting}
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 파일 업로드 */}
              <FormField
                name="fileUrl"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>전자책 파일</FormLabel>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={isSubmitting}
                        onClick={() => setIsFileEditting((c) => !c)}
                        className="text-slate-600"
                      >
                        {isFileEditting ? (
                          <>
                            <CircleX />
                            취소
                          </>
                        ) : (
                          <>
                            <FilePlus />
                            파일 업로드
                          </>
                        )}
                      </Button>
                    </div>
                    {isFileEditting ? (
                      <FormControl>
                        <FileDropzone
                          bucket="files"
                          accept="pdf"
                          setState={() => setIsFileEditting(false)}
                          onChange={field.onChange}
                          className="h-40"
                          maxSizeMB={64}
                        />
                      </FormControl>
                    ) : (
                      <div className="border rounded-md overflow-hidden h-20 flex items-center justify-center gap-x-2">
                        {field.value ? (
                          <>
                            <FileText className="size-5 text-slate-400 shrink-0" />
                            <p className="text-sm text-slate-400 truncate">
                              {field.value}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-slate-400">
                            파일이 없습니다.
                          </p>
                        )}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 상세페이지 이미지 */}
              <DetailImageUpload disabled={isSubmitting} />
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
                        활성화하면 12개월 할부 기준의 가격이 표기됩니다. (ex: 월
                        100,000원)
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

              {/* 원가 */}
              <FormField
                name="originalPrice"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>전자책 가격</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="전자책 가격을 입력해주세요."
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
            </Card>
          </div>

          {/* 양식 우측 섹션 */}
          <div className="md:col-span-2 space-y-4">
            <Card className="p-6 space-y-6">
              <div className="flex items-center gap-4 justify-end border-b pb-5">
                {/* 전자책 공개 설정 */}
                <FormField
                  name="isPublished"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <div
                        className={cn(
                          "text-xs font-medium",
                          field.value ? "text-primary" : "text-slate-400"
                        )}
                      >
                        {field.value ? "공개" : "비공개"}
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

              {/* 표지 이미지 */}
              <FormField
                name="thumbnail"
                control={form.control}
                render={({ field: { onChange, value } }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>전자책 표지이미지</FormLabel>
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
                          className="aspect-square"
                        />
                      </FormControl>
                    ) : (
                      <div className="relative w-full aspect-[2/3] border rounded-md overflow-hidden">
                        {value ? (
                          <Image
                            fill
                            src={value}
                            alt="전자책 대표이미지"
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
                      2:3 비율의 이미지를 업로드해주세요.
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
                  <FormItem>
                    <FormLabel>카테고리</FormLabel>
                    <FormControl>
                      <Combobox
                        options={categories.map((category) => ({
                          label: category.name,
                          value: category.id,
                        }))}
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                            variant={isSelected ? "default" : "outline"}
                            className="cursor-pointer"
                            style={{
                              backgroundColor: isSelected
                                ? badge.color || "#000000"
                                : "transparent",
                              color: isSelected
                                ? badge.textColor || "#ffffff"
                                : undefined,
                              borderColor: badge.color || "#000000",
                            }}
                            onClick={() => {
                              const newValue = isSelected
                                ? field.value?.filter((id) => id !== badge.id)
                                : [...(field.value || []), badge.id];
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
                        체크하면 마김일을 지정할 수 있습니다.
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
                      className={cn(!isUpcoming && "text-gray-400 select-none")}
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
                      className={cn(!isUpcoming && "text-gray-300 select-none")}
                    >
                      마감일을 선택하면 유저화면에서 카운트다운이 나오게 됩니다.
                    </FormDescription>
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
