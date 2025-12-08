"use client";

import { DatePickerComponent } from "@/components/common/date-picker-component";
import { FileDropzone } from "@/components/common/file-dropzone";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { sliderSchema, SliderSchema } from "@/validations/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { HeroSlider } from "@prisma/client";
import axios from "axios";
import { CircleX, ImagePlus, ImageUp } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  initialData: HeroSlider | null;
}

export function SliderForm({ initialData }: Props) {
  const router = useRouter();
  const [isImageEdit, setIsImageEdit] = useState(false);

  const form = useForm<SliderSchema>({
    resolver: zodResolver(sliderSchema),
    defaultValues: {
      ...initialData,
      title: initialData?.title || "",
      image: initialData?.image || "",
      link: initialData?.link || "",
      teacherName: initialData?.teacherName || "",
      openDate: initialData?.openDate || undefined,
      badge: initialData?.badge || "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: SliderSchema) => {
    try {
      if (initialData) {
        await axios.patch(
          `/api/banners/hero-sliders/${initialData.id}`,
          values
        );
      } else {
        await axios.post("/api/banners/hero-sliders", values);
      }
      toast.success("정상적으로 처리되었습니다.");
      router.push("/admin/banners/hero-sliders");
      router.refresh();
    } catch {
      toast.error("처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex justify-between items-center gap-x-2">
          <h1 className="text-lg font-semibold">슬라이드 설정</h1>

          <div className="flex items-center gap-x-5">
            {/* 강의 공개 설정 */}
            <FormField
              name="isPublished"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormLabel
                    className={cn(
                      "text-xs font-medium",
                      field.value ? "text-primary" : "text-slate-400"
                    )}
                  >
                    {field.value ? "공개" : "비공개"}
                  </FormLabel>
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

            <Button type="submit" disabled={isSubmitting}>
              {initialData ? "수정" : "저장"}
            </Button>
          </div>
        </div>
        <Separator />

        <div className="space-y-5">
          <FormField
            name="title"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>제목</FormLabel>
                <FormControl>
                  <Input
                    placeholder="제목을 입력해주세요."
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="isShowTitle"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex items-center gap-x-2 space-y-0">
                <FormLabel>슬라이드에 제목 표시</FormLabel>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="image"
            control={form.control}
            render={({ field: { onChange, value } }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>이미지</FormLabel>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
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
                      className="aspect-[12/5]"
                    />
                  </FormControl>
                ) : (
                  <div className="relative w-full aspect-[12/5] border rounded-lg overflow-hidden">
                    {value ? (
                      <Image
                        fill
                        src={value}
                        alt="히어로 슬라이더 이미지"
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
                  이미지의 용량은 1MB가 넘지 않는 것이 추천됩니다.
                </FormDescription>
                <FormDescription>이미지의 비율은 12:5입니다.</FormDescription>
              </FormItem>
            )}
          />

          <FormField
            name="teacherName"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>강사 이름</FormLabel>
                <FormControl>
                  <Input
                    placeholder="강사 이름을 입력해주세요."
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="openDate"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block">오픈일</FormLabel>
                <FormControl>
                  <DatePickerComponent
                    {...field}
                    disabled={isSubmitting}
                    className="w-[400px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="badge"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>태그 텍스트</FormLabel>
                <FormControl>
                  <Input
                    placeholder="태그 텍스트를 입력해주세요."
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="link"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>링크</FormLabel>
                <FormControl>
                  <Input
                    placeholder="링크를 입력해주세요."
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="isBlank"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex items-center gap-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormLabel>새 탭에서 열기</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="position"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>순서</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="순서를 입력해주세요."
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
