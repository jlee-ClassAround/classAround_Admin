"use client";

import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form";
import { toast } from "sonner";
import { addOption, deleteOption, getOptions } from "../actions/option-actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useOptionModal } from "@/store/use-option-modal";
import { formatPrice } from "@/utils/formats";

interface Props {
  courseId: string;
}

export function OptionAction({ courseId }: Props) {
  const [deleteOptionId, setDeleteOptionId] = useState<string | null>(null);

  const { onOpenModal } = useOptionModal();

  const { data: options, isLoading } = useQuery({
    queryKey: ["options", courseId],
    queryFn: () => getOptions(courseId),
  });

  const queryClient = useQueryClient();

  const { mutate: mutateAddOption, isPending } = useMutation({
    mutationFn: addOption,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["options", courseId],
      });
      toast.success("옵션이 추가되었습니다.");
    },
    onError: () => {
      toast.error("옵션 추가에 실패했습니다.");
    },
  });

  const { mutate: mutateDeleteOption } = useMutation({
    mutationFn: deleteOption,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["options", courseId],
      });
      toast.success("옵션이 삭제되었습니다.");
    },
    onError: () => {
      toast.error("옵션 삭제에 실패했습니다.");
    },
    onSettled: () => {
      setDeleteOptionId(null);
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <FormLabel>강의 옵션</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => mutateAddOption(courseId)}
          disabled={isPending}
          className="min-w-16"
        >
          {isPending ? <Loader2 className="animate-spin" /> : "옵션 추가"}
        </Button>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-1">
            <Skeleton className="h-10 animate-pulse" />
            <Skeleton className="h-10 animate-pulse" />
          </div>
        ) : options && options.length > 0 ? (
          options.map((option) => {
            const isDeleting = deleteOptionId === option.id;
            return (
              <div
                key={option.id}
                className="flex items-stretch gap-x-2 text-sm"
              >
                <div className="flex-1 border rounded-lg py-1 px-2 flex items-center bg-slate-50 truncate">
                  {option.name}
                </div>
                <div className="flex-1 border rounded-lg py-1 px-2 flex items-center bg-slate-50 truncate">
                  {formatPrice(option.originalPrice)}원
                </div>
                <div className="flex-1 border rounded-lg py-1 px-2 flex items-center bg-slate-50 truncate">
                  {option.discountedPrice
                    ? formatPrice(option.discountedPrice) + "원"
                    : ""}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => onOpenModal(option.id)}
                >
                  <Edit />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (confirm("정말 삭제하시겠습니까?")) {
                      mutateDeleteOption(option.id);
                      setDeleteOptionId(option.id);
                    }
                  }}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Trash2 />
                  )}
                </Button>
              </div>
            );
          })
        ) : (
          <div className="h-20 border border-dashed rounded-md flex items-center justify-center text-xs text-zinc-500">
            옵션을 추가해주세요.
          </div>
        )}
      </div>
    </div>
  );
}
