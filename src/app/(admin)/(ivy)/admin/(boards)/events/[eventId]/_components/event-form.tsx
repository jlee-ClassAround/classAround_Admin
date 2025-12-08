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
import { EventSchema, eventSchema } from "@/validations/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Event } from "@prisma/client";
import axios from "axios";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  initialData: Event | null;
}

export function EventForm({ initialData }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(
    initialData?.thumbnail || null
  );
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      thumbnail: initialData?.thumbnail || "",
    },
  });

  const onSubmit = async (values: EventSchema) => {
    try {
      setIsLoading(true);
      if (initialData) {
        await axios.patch(`/api/boards/events/${initialData.id}`, values);
      } else {
        await axios.post(`/api/boards/events`, values);
      }

      toast.success("정상적으로 처리되었습니다.");
      router.push(`/admin/boards/events`);
      router.refresh();
    } catch {
      toast.error("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
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
                <Input disabled={isLoading} {...field} />
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
          name="thumbnail"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between max-w-[300px]">
                <FormLabel>이벤트 썸네일</FormLabel>
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

        <Button type="submit" disabled={isLoading}>
          {initialData ? "업데이트" : "만들기"}
        </Button>
      </form>
    </Form>
  );
}
