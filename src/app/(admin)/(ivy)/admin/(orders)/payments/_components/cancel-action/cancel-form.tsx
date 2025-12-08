"use client";

import {
  AlertDialogCancel,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { formatPrice } from "@/utils/formats";
import { zodResolver } from "@hookform/resolvers/zod";
import { Payment } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { cancelPayment } from "../../_actions/cancel-payment";

// 통합된 환불 스키마
const cancelSchema = z
  .object({
    cancelReason: z.string().optional(),
    cancelAmount: z.string().min(1, "환불 금액을 입력해주세요"),
    isKeepEnrollment: z.boolean(),
    // 가상계좌 전용 필드들 (선택적)
    accountNumber: z.string().optional(),
    accountHolder: z.string().optional(),
    bankCode: z.string().optional(),
  })
  .refine(
    (data) => {
      // 가상계좌인 경우 필수 필드 검증
      const hasVirtualAccountFields =
        data.accountNumber && data.accountHolder && data.bankCode;
      return (
        hasVirtualAccountFields ||
        (!data.accountNumber && !data.accountHolder && !data.bankCode)
      );
    },
    {
      message: "가상계좌 환불 시 계좌 정보를 모두 입력해주세요",
      path: ["accountNumber"], // 에러 표시 위치
    }
  );

type CancelFormData = z.infer<typeof cancelSchema>;

interface Props {
  payment: Payment;
  onClose: () => void;
  setIsLoading: (isLoading: boolean) => void;
}

export function CancelForm({ payment, onClose, setIsLoading }: Props) {
  const router = useRouter();
  const isVirtualAccount = payment.paymentMethod === "VIRTUAL_ACCOUNT";

  const form = useForm<CancelFormData>({
    resolver: zodResolver(cancelSchema),
    defaultValues: {
      cancelReason: "",
      cancelAmount: "",
      isKeepEnrollment: false,
      accountNumber: "",
      accountHolder: "",
      bankCode: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: CancelFormData) => {
    try {
      setIsLoading(true);
      const result = await cancelPayment({
        paymentId: payment.id,
        cancelReason: values.cancelReason || "구매자가 취소를 원함",
        cancelAmount: Number(values.cancelAmount),
        isKeepEnrollment: values.isKeepEnrollment,
        // 가상계좌인 경우에만 계좌 정보 추가
        ...(isVirtualAccount && {
          accountNumber: values.accountNumber,
          accountHolder: values.accountHolder,
          bankCode: values.bankCode,
        }),
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success("환불이 완료되었습니다.");
      router.refresh();
      onClose();
    } catch (error) {
      toast.error("환불 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const onTotalAmount = () => {
    form.setValue(
      "cancelAmount",
      payment.refundableAmount?.toString() ?? payment.amount.toString()
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* 취소 사유 */}
        <FormField
          control={form.control}
          name="cancelReason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>취소 사유</FormLabel>
              <FormControl>
                <Input placeholder="취소 사유를 입력하세요" {...field} />
              </FormControl>
              <p className="text-xs text-gray-500">
                입력하지 않으면 기본 취소 사유로 처리됩니다. {"("}구매자가
                취소를 원함{")"}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 취소 금액 */}
        <FormField
          control={form.control}
          name="cancelAmount"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-x-2">
                <FormLabel>취소 금액</FormLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onTotalAmount}
                  className="text-foreground/75 bg-foreground/5 cursor-pointer border-none text-xs shadow-none"
                >
                  전액 입력
                </Button>
              </div>
              <FormControl>
                <Input
                  type="number"
                  placeholder="취소 금액을 입력하세요"
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-gray-500">
                취소 가능 금액:{" "}
                {formatPrice(payment.refundableAmount ?? payment.amount)}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 수강권한 유지 여부 */}
        <FormField
          control={form.control}
          name="isKeepEnrollment"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>수강권한 유지 여부</FormLabel>
              </div>
              <p className="text-xs text-gray-500">
                체크하면 수강권한이 유지됩니다.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 가상계좌 전용 필드들 */}
        {isVirtualAccount && (
          <>
            {/* 은행 선택 */}
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

            {/* 계좌번호 */}
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

            {/* 예금주 */}
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
          <AlertDialogCancel type="button" onClick={onClose}>
            닫기
          </AlertDialogCancel>
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
              "취소하기"
            )}
          </Button>
        </AlertDialogFooter>
      </form>
    </Form>
  );
}
