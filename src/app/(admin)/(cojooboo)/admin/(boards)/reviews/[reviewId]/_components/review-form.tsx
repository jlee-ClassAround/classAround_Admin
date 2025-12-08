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
import { Slider } from "@/components/ui/slider";
import { AdminReviewSchema, adminReviewSchema } from "@/validations/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Review } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { upsertReview } from "../../actions/upsert-review";

interface Props {
  initialData: Review | null;
  users: { id: string; username: string | null; email: string | null }[];
  courses: { id: string; title: string }[];
}

export function ReviewForm({ initialData, users, courses }: Props) {
  const router = useRouter();

  const form = useForm<AdminReviewSchema>({
    resolver: zodResolver(adminReviewSchema),
    defaultValues: {
      ...initialData,
      title: initialData?.title || "",
      content: initialData?.content || "",
      courseId: initialData?.courseId || "",
      userId: initialData?.userId || "",
      rating: initialData?.rating || 5,
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: AdminReviewSchema) => {
    try {
      console.log(values);
      await upsertReview({ reviewId: initialData?.id, values });
      toast.success("정상적으로 처리되었습니다.");
      router.push(`/admin/boards/reviews`);
      router.refresh();
    } catch {
      toast.error("처리 중 오류가 발생했습니다.");
    }
  };

  const rating = form.watch("rating");

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
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="courseId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>강의</FormLabel>
              <FormControl>
                <Combobox
                  options={courses.map((course) => ({
                    label: course.title,
                    value: course.id,
                  }))}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="rating"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>평점</FormLabel>
              <FormControl>
                <Slider
                  max={5}
                  step={0.5}
                  defaultValue={[field.value]}
                  onValueChange={field.onChange}
                  className="max-w-[200px]"
                />
              </FormControl>
              <div className="font-medium text-sm text-primary">{rating}점</div>
              <FormMessage />
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
