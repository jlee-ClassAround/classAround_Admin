"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { BANK_LIST } from "@/constants/payments/bank-list";
import { formatPrice } from "@/utils/formats";
import { zodResolver } from "@hookform/resolvers/zod";
import { TossCustomer } from "@prisma/client";
import { Row } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const createRefundSchema = (
  isVirtualAccount: boolean,
  isWaitingForDeposit: boolean
) =>
  z
    .object({
      cancelReason: z.string().optional(),
      cancelAmount: isWaitingForDeposit
        ? z.string().optional()
        : z.string().min(1, "환불 금액을 입력해주세요"),
      isDeleteEnrollment: z.boolean(),
      accountNumber: z.string().optional(),
      accountHolder: z.string().optional(),
      bankCode: z.string().optional(),
    })
    .refine(
      (data) => {
        if (!isVirtualAccount || isWaitingForDeposit) return true;
        return !!data.accountNumber && !!data.accountHolder && !!data.bankCode;
      },
      {
        message: "가상계좌 환불 시 계좌 정보를 모두 입력해주세요",
        path: ["accountNumber"],
      }
    );

type RefundFormData = z.infer<ReturnType<typeof createRefundSchema>>;

interface RefundActionProps {
  row: Row<TossCustomer>;
}

export function RefundAction({ row }: RefundActionProps) {
  const payment = row.original;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isVirtualAccount = payment.paymentMethod === "VIRTUAL_ACCOUNT";
  const isWaitingForDeposit =
    isVirtualAccount && payment.paymentStatus === "WAITING_FOR_DEPOSIT";

  const form = useForm<RefundFormData>({
    resolver: zodResolver(
      createRefundSchema(isVirtualAccount, isWaitingForDeposit)
    ),
    defaultValues: {
      cancelReason: "",
      cancelAmount: "",
      isDeleteEnrollment: false,
      accountNumber: "",
      accountHolder: "",
      bankCode: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: RefundFormData) => {
    try {
      const cancelAmount = isWaitingForDeposit
        ? payment.finalPrice.toString()
        : values.cancelAmount;

      const response = await fetch("/api/payment/refund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId: payment.id,
          cancelReason: values.cancelReason || "구매자가 취소를 원함",
          cancelAmount,
          isDeleteEnrollment: values.isDeleteEnrollment,
          ...(isVirtualAccount &&
            !isWaitingForDeposit && {
              bankCode: values.bankCode,
              accountNumber: values.accountNumber,
              accountHolder: values.accountHolder,
            }),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "환불 처리 실패");
      }

      toast.success("환불이 완료되었습니다.");
      router.refresh();
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "환불 처리 중 오류가 발생했습니다."
      );
    }
  };

  const handleSetFullAmount = () => {
    const fullAmount = payment.refundableAmount ?? payment.finalPrice;
    form.setValue("cancelAmount", fullAmount.toString());
  };

  if (payment.finalPrice === 0) {
    return null;
  }
  if (payment.paymentStatus === "REFUNDED" && payment.refundableAmount === 0) {
    return null;
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <span className="text-xs">환불</span>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="space-y-4">
        <AlertDialogHeader>
          <AlertDialogTitle>환불 처리</AlertDialogTitle>
          <AlertDialogDescription>
            정말 환불하시겠습니까? 환불 처리 후 되돌릴 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cancelReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>환불 사유</FormLabel>
                  <FormControl>
                    <Input placeholder="환불 사유를 입력하세요" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    입력하지 않으면 기본 취소 사유로 처리됩니다. {"("}구매자가
                    취소를 원함{")"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isWaitingForDeposit ? (
              <>
                <FormField
                  control={form.control}
                  name="cancelAmount"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>환불 금액</FormLabel>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={handleSetFullAmount}
                          className="whitespace-nowrap text-xs"
                        >
                          전액입력
                        </Button>
                      </div>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="환불 금액을 입력하세요"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        환불 가능 금액:{" "}
                        {formatPrice(
                          payment.refundableAmount ?? payment.finalPrice
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isDeleteEnrollment"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>수강 권한 삭제 여부</FormLabel>
                      </div>
                      <FormDescription className="text-xs">
                        체크하면 수강권한이 삭제됩니다.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <FormLabel>환불 금액</FormLabel>
                <div className="rounded-md border bg-muted px-3 py-2 text-sm">
                  {formatPrice(payment.finalPrice)} (전액 환불)
                </div>
                <FormDescription className="text-xs">
                  입금 대기 상태에서는 전액 환불만 가능합니다.
                </FormDescription>
              </div>
            )}

            {isVirtualAccount && !isWaitingForDeposit && (
              <>
                <FormField
                  control={form.control}
                  name="bankCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>은행</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="은행을 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BANK_LIST.map((bank) => (
                            <SelectItem key={bank.code} value={bank.code}>
                              {bank.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>계좌번호</FormLabel>
                      <FormControl>
                        <Input placeholder="계좌번호를 입력하세요" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountHolder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>예금주</FormLabel>
                      <FormControl>
                        <Input placeholder="예금주를 입력하세요" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel type="button">취소</AlertDialogCancel>
              <Button
                type="submit"
                className="bg-red-500 hover:bg-red-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    처리중...
                  </>
                ) : (
                  "환불"
                )}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
