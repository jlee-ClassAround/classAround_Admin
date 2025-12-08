"use client";

import { DatePickerComponent } from "@/components/common/date-picker-component";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { couponSchema, CouponSchema } from "@/validations/schemas";
import { cn } from "@/lib/utils";
import { generateRandomCode } from "@/utils/generate-random-code";
import { zodResolver } from "@hookform/resolvers/zod";
import { Coupon } from "@prisma/client";
import axios from "axios";
import { Save, SparklesIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CourseSearchCommand } from "./course-search-command";

interface Props {
  couponData:
    | (Coupon & {
        courses: {
          id: string;
          title: string;
        }[];
      })
    | null;
  courses: {
    id: string;
    title: string;
  }[];
}

export default function CouponForm({ couponData, courses }: Props) {
  const router = useRouter();

  const form = useForm<CouponSchema>({
    resolver: zodResolver(couponSchema),
    defaultValues: couponData
      ? {
          ...couponData,
          courses: couponData.courses.map((course) => ({
            id: course.id,
            label: course.title,
          })),
        }
      : {
          name: "",
          description: "",
          code: "",
          discountType: "",
          discountAmount: undefined,
          expiryDate: undefined,
          usageLimit: undefined,
        },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: CouponSchema) => {
    try {
      if (!!couponData) {
        await axios.put(`/api/coupons/${couponData.id}`, values);
      } else {
        await axios.post(`/api/coupons`, values);
      }
      toast.success("정상적으로 처리되었습니다.");
      router.push("/admin/coupons/all");
      router.refresh();
    } catch {
      toast.error("처리 중 오류가 발생했습니다.");
    }
  };

  const discountType = form.watch("discountType");
  const isTypeEmpty = discountType === "";
  const isPercentage = discountType === "percentage";

  useEffect(() => {
    if (isPercentage) {
      if (form.watch("discountAmount") > 100) {
        form.setValue("discountAmount", 100);
      }
    }
  }, [discountType, isPercentage, form]);

  const handleGenerateCode = () => {
    const randomCode = generateRandomCode(8);
    form.setValue("code", randomCode);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>쿠폰명</FormLabel>
              <FormControl>
                <Input
                  placeholder="ex) 24년 마지막 50,000원 할인쿠폰"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
              <FormDescription>쿠폰명을 입력해주세요.</FormDescription>
            </FormItem>
          )}
        />

        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>쿠폰설명</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="ex) 24년이 종료되기 전에 이벤트에
                참여하신 분들을 위한 쿠폰입니다."
                  disabled={isSubmitting}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
              <FormDescription>쿠폰설명을 입력해주세요.</FormDescription>
            </FormItem>
          )}
        />

        <FormField
          name="code"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-x-2">
                <FormLabel>쿠폰 코드</FormLabel>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleGenerateCode}
                >
                  코드 생성
                </Button>
              </div>
              <FormControl>
                <Input
                  placeholder="쿠폰 코드를 입력해주세요."
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>

              <FormMessage />
              <FormDescription>쿠폰 코드를 생성해주세요.</FormDescription>
            </FormItem>
          )}
        />

        <FormField
          name="discountType"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>할인 방식</FormLabel>
              <Select
                defaultValue={field.value}
                onValueChange={field.onChange}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="할인 방식을 선택해주세요." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="percentage">비율 할인(%)</SelectItem>
                  <SelectItem value="fixed">고정 금액 할인</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
              <FormDescription>
                선택에 따라 할인 방식이 달라집니다.
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          name="discountAmount"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className={cn(isTypeEmpty && "text-gray-400")}>
                {isPercentage ? "할인 비율" : "할인 금액"}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="할인 금액 혹은 비율을 입력해주세요."
                  disabled={isTypeEmpty || isSubmitting}
                  {...field}
                  {...(isPercentage
                    ? {
                        max: 100,
                        onChange: (e) => {
                          const value = parseFloat(e.target.value);
                          if (value > 100) {
                            field.onChange(100);
                          } else {
                            field.onChange(value);
                          }
                        },
                      }
                    : {})}
                />
              </FormControl>
              <FormMessage />
              <FormDescription className={cn(isTypeEmpty && "text-gray-300")}>
                할인 방식을 비율로 선택했다면 %값을, 고정 금액을 선택했다면 고정
                값을 입력해주세요.
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          name="expiryDate"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <div>
                <FormLabel>쿠폰 만료 날짜</FormLabel>
              </div>
              <FormControl>
                <DatePickerComponent
                  value={field.value}
                  onChange={field.onChange}
                  className="w-[300px]"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
              <FormDescription>
                선택한 시간에 쿠폰이 만료됩니다.
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          name="usageLimit"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>쿠폰 사용가능 개수</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="제한없음"
                  disabled={isSubmitting}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
              <FormDescription>
                쿠폰의 최대사용 갯수를 입력해주세요. 입력하지 않으면 사용제한이
                없어집니다.
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          name="courses"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>쿠폰 사용가능 강의</FormLabel>
              <div className="flex items-center flex-wrap gap-1">
                {field.value?.map((course) => (
                  <div
                    key={course.id}
                    className="text-xs bg-foreground/5 text-foreground/80 rounded-full py-1 px-1 whitespace-nowrap flex flex-nowrap items-center gap-1"
                  >
                    {course.label}
                    <XIcon
                      className="size-4 cursor-pointer border border-foreground/20 rounded-full p-0.5 hover:bg-foreground/20 transition-colors"
                      onClick={() => {
                        field.onChange(
                          field.value?.filter((val) => val.id !== course.id)
                        );
                      }}
                    />
                  </div>
                ))}
              </div>
              <FormControl>
                <CourseSearchCommand
                  options={courses.map((course) => ({
                    id: course.id,
                    label: course.title,
                  }))}
                  onChange={field.onChange}
                  value={field.value}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
              <FormDescription>
                쿠폰의 최대사용 갯수를 입력해주세요. 입력하지 않으면 사용제한이
                없어집니다.
              </FormDescription>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {!!couponData ? (
            <>
              <Save />
              저장
            </>
          ) : (
            <>
              <SparklesIcon />
              만들기
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
