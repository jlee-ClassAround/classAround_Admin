"use client";

import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import {
  COURSE_TITLE_MESSAGE,
  COURSE_TITLE_PLACEHOLDER,
  ERROR_MESSAGE,
  SUCCESS_MESSAGE,
} from "@/constants/validate-message";
import { Card } from "@/components/ui/card";

const schema = z.object({
  title: z.string().min(1, COURSE_TITLE_MESSAGE),
});

export default function CreateCourses() {
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
      const res = await axios.post(`/api/courses/create`, values);
      toast.success(SUCCESS_MESSAGE);
      form.reset();
      router.push(`/admin/courses/${res.data.id}`);
      router.refresh();
    } catch {
      toast.error(ERROR_MESSAGE);
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
                    placeholder={COURSE_TITLE_PLACEHOLDER}
                    className="bg-white"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="hover:bg-slate-500"
          >
            만들기
          </Button>
        </form>
      </Form>
    </Card>
  );
}
