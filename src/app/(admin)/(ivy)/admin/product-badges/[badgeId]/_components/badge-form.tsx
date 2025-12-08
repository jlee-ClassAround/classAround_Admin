"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
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
import { ProductBadge } from "@prisma/client";

interface Props {
  initialData: ProductBadge | null;
}

const badgeSchema = z.object({
  name: z.string().min(1, "배지명을 입력해주세요."),
  description: z.string().optional(),
  color: z
    .string()
    .min(1, "배경색을 선택해주세요.")
    .regex(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      "올바른 HEX 색상 코드를 입력해주세요."
    ),
  textColor: z
    .string()
    .min(1, "텍스트 색상을 선택해주세요.")
    .regex(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      "올바른 HEX 색상 코드를 입력해주세요."
    ),
});

type BadgeSchema = z.infer<typeof badgeSchema>;

export function BadgeForm({ initialData }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BadgeSchema>({
    resolver: zodResolver(badgeSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      color: initialData?.color || "#000000",
      textColor: initialData?.textColor || "#FFFFFF",
    },
  });

  const onSubmit = async (values: BadgeSchema) => {
    try {
      setIsSubmitting(true);
      if (initialData) {
        await axios.patch(`/api/product-badges/${initialData.id}`, values);
      } else {
        await axios.post("/api/product-badges", values);
      }
      toast.success("정상적으로 처리되었습니다.");
      router.push("/admin/product-badges/all");
      router.refresh();
    } catch {
      toast.error("처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchColor = form.watch("color");
  const watchTextColor = form.watch("textColor");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>배지명</FormLabel>
              <FormControl>
                <Input
                  disabled={isSubmitting}
                  placeholder="배지명을 입력해주세요."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>설명</FormLabel>
              <FormControl>
                <Input
                  disabled={isSubmitting}
                  placeholder="배지에 대한 설명을 입력해주세요."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            name="color"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>배경 색상</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-x-2">
                    <Input
                      type="color"
                      disabled={isSubmitting}
                      {...field}
                      className="w-20 h-10 p-1"
                    />
                    <Input
                      disabled={isSubmitting}
                      {...field}
                      placeholder="#000000"
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  배지의 배경 색상을 선택해주세요.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="textColor"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>텍스트 색상</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-x-2">
                    <Input
                      type="color"
                      disabled={isSubmitting}
                      {...field}
                      className="w-20 h-10 p-1"
                    />
                    <Input
                      disabled={isSubmitting}
                      {...field}
                      placeholder="#FFFFFF"
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  배지의 텍스트 색상을 선택해주세요.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">미리보기</div>
          <Badge
            variant="outline"
            style={{
              backgroundColor: watchColor,
              color: watchTextColor,
              borderColor: watchColor,
            }}
          >
            {form.watch("name") || "배지 미리보기"}
          </Badge>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {initialData ? "수정하기" : "만들기"}
        </Button>
      </form>
    </Form>
  );
}
