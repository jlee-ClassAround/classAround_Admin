"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";
import { Row } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { PaymentWithRelations } from "../../_queries/get-payments";
import { CancelForm } from "./cancel-form";

interface Props {
  row: Row<PaymentWithRelations>;
}

export function CancelAction({ row }: Props) {
  const payment = row.original;
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (
    payment.amount === 0 ||
    payment.paymentStatus === "CANCELED" ||
    payment.paymentStatus === "WAITING_FOR_DEPOSIT" ||
    payment.paymentMethod === "DIRECT_DEPOSIT"
  ) {
    return null;
  }
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={isLoading}
          onClick={() => setOpen(true)}
          className="h-6"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <span className="text-xs">취소</span>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="space-y-4">
        <AlertDialogHeader>
          <AlertDialogTitle>취소 처리</AlertDialogTitle>
          <AlertDialogDescription>
            정말 취소하시겠습니까? 취소 처리 후 되돌릴 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <CancelForm
          payment={payment}
          onClose={() => setOpen(false)}
          setIsLoading={setIsLoading}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}
