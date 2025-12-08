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
import { getBillingTypeToKr } from "@/utils/payments/get-enum-to-kr";
import { BillingSnapshot } from "@prisma/client";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Props {
  isLoading: boolean;
  handleApprove: () => void;
  billingType: BillingSnapshot["billingType"] | null;
}

export default function ApproveModal({
  isLoading,
  handleApprove,
  billingType,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" onClick={() => setOpen(true)}>
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <span className="text-xs">승인</span>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="space-y-4">
        <AlertDialogHeader>
          <AlertDialogTitle>승인 처리</AlertDialogTitle>
          <AlertDialogDescription className="whitespace-pre-line">
            유저에게 수강 권한이 부여됩니다.
            <br />
            승인 전 입금내역을 확인해주세요.
            <br />
            승인시 고객이 선택한 청구서 유형에 따라 현금영수증 또는 세금계산서가
            발행됩니다.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 text-sm text-muted-foreground">
          {billingType === "TAX_INVOICE" && (
            <div className="space-y-2">
              <div>
                사업자정보를 입력하지 않으셨다면 세금계산서가 발행되지 않습니다.
                <br />
                사업자정보를 입력해주세요.
              </div>
              <Link
                href="/admin/settings/business"
                className="underline text-foreground"
              >
                사업자정보 입력하기
              </Link>
            </div>
          )}
          {billingType && (
            <div className="text-foreground/75 text-lg">
              해당 고객은{" "}
              <span className="font-bold text-foreground">
                {getBillingTypeToKr(billingType)}
              </span>
              이(가) 발행됩니다.
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleApprove}
            className="bg-green-500 hover:bg-green-600"
          >
            승인
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
