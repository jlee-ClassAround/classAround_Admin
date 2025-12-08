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
import { zodResolver } from "@hookform/resolvers/zod";

import { CircleX, ImagePlus, ImageUp, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { IGetCategories } from "@/actions/categories/get-categories";
import { FileDropzone } from "@/components/common/file-dropzone";
import Tiptap from "@/components/tiptap/tiptap";
import { Combobox } from "@/components/ui/combobox";
import { Switch } from "@/components/ui/switch";
import {
  ERROR_MESSAGE,
  SUCCESS_MESSAGE,
  TEACHER_NAME_PLACEHOLDER,
} from "@/constants/validate-message";
import { cn } from "@/lib/utils";
import { teacherSchema, TeacherSchema } from "@/validations/schemas";
import { Teacher } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Props {
  initialData: Teacher;
  categories: IGetCategories[];
}

export function TeacherForm({ initialData, categories }: Props) {
  const router = useRouter();
  const [isImageEdit, setIsImageEdit] = useState(false);

  const form = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      name: initialData.name,
      info: initialData.info || "",
      profile: initialData.profile || "",
      isPublished: initialData.isPublished,
      categoryId: initialData.categoryId || undefined,
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: TeacherSchema) => {
    try {
      await axios.put(`/api/teachers/${initialData.id}`, values);
      toast.success(SUCCESS_MESSAGE);
      router.refresh();
      router.push("/admin/teachers/all");
    } catch {
      toast.error(ERROR_MESSAGE);
    }
  };

  return (
    <div className="p-8 rounded-lg border bg-white shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex items-center justify-between border-b pb-5 mb-6">
            <h2 className="font-semibold text-lg">강의 설정</h2>
            <div className="flex items-center gap-4">
              {/* 강의 공개 설정 */}
              <FormField
                name="isPublished"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <div
                      className={cn(
                        "text-xs font-medium",
                        field.value ? "text-primary" : "text-foreground/50"
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

              <Button type="submit" disabled={isSubmitting || !isValid}>
                {isSubmitting ? (
                  <>
                    저장중 <Loader2 className="animate-spin" />
                  </>
                ) : (
                  <>저장</>
                )}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-5 md:col-span-2">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>강사 이름</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={TEACHER_NAME_PLACEHOLDER}
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="info"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>강사 소개</FormLabel>
                    <FormControl>
                      <Tiptap
                        content={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="categoryId"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>강사 카테고리</FormLabel>
                    <FormControl>
                      <Combobox
                        options={categories.map((category) => ({
                          label: category.name,
                          value: category.id,
                        }))}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-5 md:col-span-1">
              <FormField
                name="profile"
                control={form.control}
                render={({ field: { onChange, value } }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>강사 프로필사진</FormLabel>
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
                          className="aspect-[4/5]"
                        />
                      </FormControl>
                    ) : (
                      <div className="relative w-full aspect-[4/5] border rounded-lg overflow-hidden">
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
                      이미지의 용량은 1MB가 넘지 않는 것이 추천됩니다. 이미지의
                      비율을 4:5입니다.
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
