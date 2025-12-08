"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  checkBusinessNumber,
  formatPhoneNumberWithHyphen,
} from "@/utils/formats";
import { zodResolver } from "@hookform/resolvers/zod";
import { SiteSetting } from "@prisma/client";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { isMobilePhone } from "validator";
import * as z from "zod";
import { updateBusinessSettings } from "../../_actions/update-business-settings";

const businessFormSchema = z.object({
  // 사업자 정보
  companyName: z.string().min(1, "회사명을 입력해주세요."),
  ceoName: z.string().min(1, "대표자명을 입력해주세요."),
  businessNumber: z
    .string()
    .min(1, { message: "사업자등록번호를 입력해주세요." })
    .transform((val) => val.replace(/-/g, ""))
    .refine(
      (val) => checkBusinessNumber(val),
      "정확한 사업자등록번호를 입력해주세요."
    ),

  // 추가 정보
  businessAddress: z.string().min(1, "사업장 주소를 입력해주세요."),
  branchNumber: z.string().optional(),
  businessType: z.string().min(1, "업태를 입력해주세요."),
  businessItem: z.string().min(1, "종목을 입력해주세요."),

  // 담당자 정보
  managerEmail: z.string().email("올바른 이메일 형식이 아닙니다."),
  managerName: z
    .string()
    .min(1, "이름을 입력해주세요.")
    .max(10, "최대 10자까지 입력할 수 있습니다."),
  managerPhone: z
    .string()
    .min(1, { message: "전화번호를 입력해주세요." })
    .transform((val) => formatPhoneNumberWithHyphen(val))
    .refine(
      (val) => isMobilePhone(val, "ko-KR"),
      "정확한 휴대폰번호를 입력해주세요."
    ),
});

export type BusinessFormSchema = z.infer<typeof businessFormSchema>;

interface Props {
  initialData: SiteSetting | null;
}

export default function BusinessForm({ initialData }: Props) {
  const router = useRouter();

  const form = useForm<BusinessFormSchema>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      companyName: initialData?.companyName || "",
      ceoName: initialData?.ceoName || "",
      businessNumber: initialData?.businessNumber || "",
      businessAddress: initialData?.businessAddress || "",
      branchNumber: initialData?.branchNumber || "",
      businessType: initialData?.businessType || "",
      businessItem: initialData?.businessItem || "",
      managerEmail: initialData?.managerEmail || "",
      managerName: initialData?.managerName || "",
      managerPhone: initialData?.managerPhone || "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: BusinessFormSchema) => {
    try {
      await updateBusinessSettings(values);
      toast.success("저장되었습니다.");
      router.refresh();
    } catch (error) {
      toast.error("오류 발생");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="space-y-8">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-semibold text-lg">사업자 정보</h2>
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

            {/* 사업자 정보 */}
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground">
                  기본 정보
                </h2>
              </div>
              <div className="grid grid-cols-12 gap-5">
                <div className="col-span-12">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="required">회사명</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="회사명"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <FormField
                    control={form.control}
                    name="ceoName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="required">대표자명</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="대표자명"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <FormField
                    control={form.control}
                    name="businessNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="required">
                          사업자등록번호
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="사업자등록번호"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* 추가 정보 */}
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground">
                  추가 정보
                </h2>
              </div>
              <div className="grid grid-cols-12 gap-5">
                <div className="col-span-12 md:col-span-8 lg:col-span-9">
                  <FormField
                    control={form.control}
                    name="businessAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="required">사업장 주소</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="사업장 주소"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-12 md:col-span-4 lg:col-span-3">
                  <FormField
                    control={form.control}
                    name="branchNumber"
                    render={({ field }) => (
                      <FormItem>
                        <div className="mt-2 flex items-center">
                          <FormLabel>종사업장 번호</FormLabel>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertCircle className="ml-1 h-4 w-4 text-foreground/50" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                사업자등록증에 기재되어 있는 경우에 입력해
                                주세요.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="4자리 숫자"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="required">업태</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="업태"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <FormField
                    control={form.control}
                    name="businessItem"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="required">종목</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="종목"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* 담당자 정보 */}
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground">
                  담당자 정보
                </h2>
                <p className="mt-1 text-sm text-foreground/50">
                  세금계산서 발행 시 입력되는 담당자 정보입니다.
                </p>
              </div>
              <div className="grid grid-cols-12 gap-5">
                <div className="col-span-12">
                  <FormField
                    control={form.control}
                    name="managerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="required">이메일</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="이메일"
                            type="email"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <FormField
                    control={form.control}
                    name="managerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="required">이름</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="이름"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <FormField
                    control={form.control}
                    name="managerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="required">휴대전화번호</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="숫자만입력"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
