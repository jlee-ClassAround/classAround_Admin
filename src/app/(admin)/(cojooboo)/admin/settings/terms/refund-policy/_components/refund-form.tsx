"use client";

import { Button } from "@/components/ui/button";
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

import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { termsSchema, TermsSchema } from "@/validations/schemas";
import { useRouter } from "next/navigation";
import { Terms } from "@prisma/client";
import { toast } from "sonner";
import Tiptap from "@/components/tiptap/tiptap";
import { updateTerms } from "../../../_actions/update-terms";

interface Props {
  initialData: Terms | null;
}

export function RefundForm({ initialData }: Props) {
  const router = useRouter();

  const form = useForm<TermsSchema>({
    resolver: zodResolver(termsSchema),
    defaultValues: {
      ...initialData,
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: TermsSchema) => {
    try {
      await updateTerms({ id: 3, values });
      toast.success("저장되었습니다.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "알 수 없는 오류");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>제목</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>내용</FormLabel>
              <FormControl>
                <Tiptap content={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting || !isValid}>
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "저장"}
        </Button>
      </form>
    </Form>
  );
}
