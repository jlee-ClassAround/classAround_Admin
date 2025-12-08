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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BANK_LIST } from "@/constants/payments/bank-list";
import { zodResolver } from "@hookform/resolvers/zod";
import { SiteSetting } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { updateAccountSettings } from "../../_actions/update-account-settings";

const accountFormSchema = z.object({
  bankCode: z.string().min(1, "은행을 선택해주세요."),
  bankAccountNumber: z.string().min(1, "계좌번호를 입력해주세요."),
  bankHolderName: z.string().min(1, "예금주명을 입력해주세요."),
});

export type AccountFormSchema = z.infer<typeof accountFormSchema>;

interface Props {
  initialData: SiteSetting | null;
}

export default function AccountForm({ initialData }: Props) {
  const router = useRouter();

  const form = useForm<AccountFormSchema>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      bankCode: initialData?.bankCode || "",
      bankAccountNumber: initialData?.bankAccountNumber || "",
      bankHolderName: initialData?.bankHolderName || "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: AccountFormSchema) => {
    try {
      await updateAccountSettings(values);
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
              <h2 className="font-semibold text-lg">계좌 정보</h2>
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

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 md:col-span-6">
                <FormField
                  control={form.control}
                  name="bankCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="required">은행</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="은행을 선택하세요" />
                          </SelectTrigger>
                          <SelectContent>
                            {BANK_LIST.map((bank) => (
                              <SelectItem key={bank.code} value={bank.code}>
                                {bank.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-12 md:col-span-6">
                <FormField
                  control={form.control}
                  name="bankAccountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="required">계좌번호</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="계좌번호"
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
                  name="bankHolderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="required">예금주명</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="예금주명"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
