"use client";

import { DatePickerComponent } from "@/components/common/date-picker-component";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { updateEnrollmentEndDates } from "../_actions/update-enrollment-end-dates";

interface BulkEditButtonProps {
  courseId: string;
}

export function BulkEditButton({ courseId }: BulkEditButtonProps) {
  const [open, setOpen] = useState(false);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [isUpdatingDates, setIsUpdatingDates] = useState(false);

  const handleBulkUpdateEndDates = async () => {
    if (!isUnlimited && !endDate) {
      toast.error("만료일자를 입력해주세요.");
      return;
    }

    const confirmMessage = isUnlimited
      ? "모든 수강생을 무제한 수강으로 변경하시겠습니까? 이 작업은 취소할 수 없습니다."
      : "만료일자를 수정하시겠습니까? 이 작업은 취소할 수 없습니다. 모든 수강생의 만료일자가 변경됩니다.";

    if (!confirm(confirmMessage)) {
      return;
    }
    try {
      setIsUpdatingDates(true);

      const result = await updateEnrollmentEndDates({
        courseId,
        endDate: isUnlimited ? null : endDate,
      });

      if (result.success) {
        toast.success(
          isUnlimited
            ? `${result.updatedCount}명이 무제한 수강으로 변경되었습니다.`
            : `${result.updatedCount}명의 만료일자가 수정되었습니다.`
        );
        setOpen(false);
        setEndDate(null);
        setIsUnlimited(false);
        // 페이지 새로고침
        window.location.reload();
      } else {
        toast.error(result.error || "만료일자 수정 중 오류가 발생했습니다.");
      }
    } catch (error) {
      toast.error("만료일자 수정 중 오류가 발생했습니다.");
    } finally {
      setIsUpdatingDates(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="flex items-center gap-x-1"
      >
        <Calendar className="size-4" />
        만료일자 일괄 수정
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>만료일자 일괄 수정</DialogTitle>
            <DialogDescription>
              모든 수강생의 만료일자를 일괄적으로 수정합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="unlimited"
                checked={isUnlimited}
                onCheckedChange={(checked) => {
                  setIsUnlimited(checked === true);
                  if (checked) {
                    setEndDate(null);
                  }
                }}
              />
              <Label
                htmlFor="unlimited"
                className="text-sm font-normal cursor-pointer"
              >
                무제한 수강
              </Label>
            </div>
            <div className="flex flex-col gap-y-2">
              <Label>만료일자</Label>
              <DatePickerComponent
                value={endDate}
                onChange={(date) => setEndDate(date)}
                disabled={isUnlimited}
              />
              <p className="text-xs text-muted-foreground">
                {isUnlimited
                  ? "모든 수강생이 무제한으로 수강 가능합니다."
                  : "선택한 날짜로 모든 수강생의 만료일자가 변경됩니다."}
              </p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>

            <Button
              disabled={isUpdatingDates || (!isUnlimited && !endDate)}
              onClick={handleBulkUpdateEndDates}
            >
              {isUpdatingDates ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "수정하기"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
