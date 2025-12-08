"use client";

import { FileDropzone } from "@/components/common/file-dropzone";
import Tiptap from "@/components/tiptap/tiptap";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
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
import { AdminRevenueSchema, adminRevenueSchema } from "@/validations/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Revenue } from "@prisma/client";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { upsertRevenue } from "../../actions/upsert-revenue";

interface Props {
  initialData: Revenue | null;
  users: { id: string; username: string | null; email: string | null }[];
}

export function RevenueForm({ initialData, users }: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(
    initialData?.photo || null
  );

  const form = useForm<AdminRevenueSchema>({
    resolver: zodResolver(adminRevenueSchema),
    defaultValues: {
      ...initialData,
      title: initialData?.title || "",
      content: initialData?.content || "",
      amount: initialData?.amount || undefined,
      photo: initialData?.photo || "",
      videoUrl: initialData?.videoUrl || "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: AdminRevenueSchema) => {
    try {
      await upsertRevenue({ revenueId: initialData?.id, values });
      toast.success("정상적으로 처리되었습니다.");
      router.push(`/admin/boards/revenues`);
      router.refresh();
    } catch {
      toast.error("처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          name="title"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>제목</FormLabel>
              <FormControl>
                <Input disabled={isSubmitting} {...field} />
              </FormControl>
              <FormMessage />
              <FormDescription>제목을 입력해주세요.</FormDescription>
            </FormItem>
          )}
        />

        <FormField
          name="content"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>내용</FormLabel>
              <FormControl>
                <Tiptap content={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
              <FormDescription>내용을 입력해주세요.</FormDescription>
            </FormItem>
          )}
        />

        <FormField
          name="videoUrl"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>영상</FormLabel>
              <FormControl>
                <Input disabled={isSubmitting} {...field} />
              </FormControl>
              <FormMessage />
              <FormDescription>영상 링크를 입력해주세요.</FormDescription>
            </FormItem>
          )}
        />
        <FormField
          name="amount"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>수익</FormLabel>
              <FormControl>
                <Input disabled={isSubmitting} {...field} />
              </FormControl>
              <FormMessage />
              <FormDescription>수익을 입력해주세요.</FormDescription>
            </FormItem>
          )}
        />

        <FormField
          name="photo"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between max-w-[300px]">
                <FormLabel>수익인증 사진</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "취소" : "편집"}
                </Button>
              </div>
              {isEditing ? (
                <FormControl>
                  <FileDropzone
                    bucket="images"
                    setPreviewImage={setPreviewImage}
                    setState={() => setIsEditing(false)}
                    onChange={field.onChange}
                    className="aspect-video max-w-[300px] p-5"
                  />
                </FormControl>
              ) : (
                <div className="relative aspect-video max-w-[300px] w-full rounded-lg overflow-hidden bg-gray-50 mt-2 shadow-sm">
                  {previewImage ? (
                    <Image
                      fill
                      src={previewImage}
                      alt="Preview Image"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="size-6 text-gray-500" />
                    </div>
                  )}
                </div>
              )}
              <FormMessage />
              <FormDescription>이미지를 업로드해주세요.</FormDescription>
            </FormItem>
          )}
        />

        <FormField
          name="userId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>작성자</FormLabel>
              <FormControl>
                <Combobox
                  options={users.map((user) => ({
                    label: `${user.username} - ${user.email}` || "",
                    value: user.id,
                  }))}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {initialData ? "업데이트" : "만들기"}
        </Button>
      </form>
    </Form>
  );
}
