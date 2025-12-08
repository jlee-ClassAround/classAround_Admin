"use client";

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
import { Switch } from "@/components/ui/switch";
import { faqSchema, FaqSchema } from "@/validations/schemas";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category, Faq } from "@prisma/client";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  initialData: Faq | null;
  categories: Category[];
}

export function FaqForm({ initialData, categories }: Props) {
  const router = useRouter();

  const form = useForm<FaqSchema>({
    resolver: zodResolver(faqSchema),
    defaultValues: initialData || {
      title: "",
      content: "",
      categoryId: undefined,
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: FaqSchema) => {
    try {
      if (initialData) {
        await axios.patch(`/api/boards/faqs/${initialData.id}`, values);
      } else {
        await axios.post(`/api/boards/faqs`, values);
      }

      toast.success("정상적으로 처리되었습니다.");
      router.push(`/admin/faqs/all`);
      router.refresh();
    } catch {
      toast.error("처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-center gap-4 justify-end border-b pb-5">
          {/* 강의 공개 설정 */}
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
            ) : initialData ? (
              <>저장</>
            ) : (
              <>생성</>
            )}
          </Button>
        </div>

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
          name="categoryId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>카테고리</FormLabel>
              <FormControl>
                <Combobox
                  disabled={isSubmitting}
                  options={categories.map((category) => ({
                    label: category.name,
                    value: category.id,
                  }))}
                  {...field}
                />
              </FormControl>
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
      </form>
    </Form>
  );
}
