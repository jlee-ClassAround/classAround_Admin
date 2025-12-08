"use client";

import { FileDropzone } from "@/components/common/file-dropzone";
import Tiptap from "@/components/tiptap/tiptap";
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
import { PostSchema, postSchema } from "@/validations/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Post } from "@prisma/client";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createPost, updatePost } from "../../actions";

interface Props {
  initialData: Post | null;
}

export function PostForm({ initialData }: Props) {
  const router = useRouter();
  const [previewImage, setPreviewImage] = useState<string | null>(
    initialData?.thumbnail || null
  );
  const [isEditing, setIsEditing] = useState(false);
  const form = useForm<PostSchema>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      thumbnail: initialData?.thumbnail || "",
      externalLink: initialData?.externalLink || "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: PostSchema) => {
    try {
      if (initialData) {
        await updatePost(initialData.id, values);
      } else {
        await createPost(values);
      }

      toast.success("정상적으로 처리되었습니다.");
      router.push(`/admin/posts`);
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
          name="externalLink"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>외부 컬럼 링크</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://www.google.com" />
              </FormControl>
              <FormMessage />
              <FormDescription>
                외부 링크를 입력해주세요. (예: https://www.google.com)
                <br />
                링크를 입력하면 바로 외부 링크로 이동합니다.
              </FormDescription>
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
          name="thumbnail"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between max-w-[300px]">
                <FormLabel>칼럼 썸네일</FormLabel>
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

        <Button type="submit" disabled={isSubmitting}>
          {initialData ? "업데이트" : "만들기"}
        </Button>
      </form>
    </Form>
  );
}
