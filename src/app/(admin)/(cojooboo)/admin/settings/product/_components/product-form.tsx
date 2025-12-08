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
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import Tiptap from "@/components/tiptap/tiptap";
import { SiteSetting } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as z from "zod";
import { updateBasicSettings } from "../../_actions/update-basic-settings";

const productFormSchema = z.object({
  courseRefundPolicy: z.string().optional(),
  ebookRefundPolicy: z.string().optional(),
  marketingPolicy: z.string().optional(),
});

type ProductFormSchema = z.infer<typeof productFormSchema>;

interface Props {
  initialData: SiteSetting | null;
}

export default function ProductForm({ initialData }: Props) {
  const router = useRouter();

  const form = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      courseRefundPolicy: initialData?.courseRefundPolicy || "",
      ebookRefundPolicy: initialData?.ebookRefundPolicy || "",
      marketingPolicy: initialData?.marketingPolicy || "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: ProductFormSchema) => {
    try {
      await updateBasicSettings(values);
      toast.success("저장되었습니다.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "알 수 없는 오류");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="space-y-8">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-semibold text-lg text-foreground">
                환불 정책
              </h2>
              <div className="flex items-center gap-4">
                <Button type="submit" disabled={isSubmitting}>
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

            <div className="space-y-5">
              <FormField
                name="courseRefundPolicy"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>강의 환불 정책</FormLabel>
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
                name="ebookRefundPolicy"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>전자책 환불 정책</FormLabel>
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
                name="marketingPolicy"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>마케팅 정책</FormLabel>
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
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
