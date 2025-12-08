"use client";

import axios from "axios";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createFreeCourse } from "../actions";

const schema = z.object({
  title: z.string().min(1, "강의 제목을 입력해주세요."),
});

export default function CreateFreeCourses() {
  const router = useRouter();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      const res = await createFreeCourse(values);

      toast.success("저장되었습니다.");
      form.reset();
      router.push(`/admin/free-courses/${res.id}`);
      router.refresh();
    } catch {
      toast.error("오류가 발생했습니다.");
    }
  };

  return (
    <Card className="max-w-[400px] mx-auto p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            name="title"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>강의 제목</FormLabel>
                <FormControl>
                  <Input
                    placeholder="강의 제목을 입력해주세요."
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting || !isValid}>
            만들기
          </Button>
        </form>
      </Form>
    </Card>
  );
}
