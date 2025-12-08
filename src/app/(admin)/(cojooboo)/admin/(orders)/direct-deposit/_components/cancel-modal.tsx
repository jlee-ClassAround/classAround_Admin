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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cancelDirectDeposit } from "../_actions/cancel-direct-deposit";

interface Props {
  orderId: string;
  buyerName: string;
  productName: string;
  paymentDate: string;
  paymentId: string;
  userId: string;
  productId: string;
  cancelableAmount: number;
}

export function CancelModal({
  orderId,
  buyerName,
  productName,
  paymentDate,
  paymentId,
  userId,
  productId,
  cancelableAmount,
}: Props) {
  const router = useRouter();
  const [cancelAmount, setCancelAmount] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    try {
      if (!cancelAmount) return;
      setIsLoading(true);
      const result = await cancelDirectDeposit(
        orderId,
        paymentId,
        userId,
        productId,
        cancelAmount,
        cancelReason
      );
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("취소 처리 완료");
      router.refresh();
    } catch (e) {
      console.log("취소 처리 실패", e);
      toast.error("취소 처리 실패");
    } finally {
      setIsLoading(false);
      setCancelAmount(null);
      setCancelReason("");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="text-xs text-red-500/75 hover:underline cursor-pointer"
          onClick={() => setOpen(true)}
        >
          취소하기
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>취소 처리</AlertDialogTitle>
          <AlertDialogDescription>
            취소 처리 시 현금영수증 또는 세금계산서도 발행 취소처리 됩니다.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">취소 금액</Label>
            <div className="flex items-center gap-2">
              <Input
                id="amount"
                type="number"
                placeholder="취소 금액을 입력하세요"
                value={cancelAmount || ""}
                onChange={(e) => setCancelAmount(Number(e.target.value))}
              />
              <span className="text-sm text-muted-foreground">원</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => setCancelAmount(cancelableAmount)}
            >
              전액 입력
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">취소 사유</Label>
            <Textarea
              id="reason"
              placeholder="취소 사유를 입력하세요"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>

          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">주문번호</span>
              <span className="font-mono">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">구매자</span>
              <span>{buyerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">구매상품</span>
              <span>{productName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">결제일시</span>
              <span>{paymentDate}</span>
            </div>
            <div className="flex justify-between font-semibold text-foreground">
              <span>취소가능액</span>
              <span>{cancelableAmount.toLocaleString()}원</span>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={!cancelAmount}
            className="bg-red-500 hover:bg-red-600"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <span>취소하기</span>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
