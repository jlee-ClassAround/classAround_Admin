"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { optionSchema, OptionSchema } from "@/validations/schemas";
import { useOptionModal } from "@/store/use-option-modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { getOption, updateOption } from "../actions/option-actions";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Props {
  courseId: string;
}

export function OptionModal({ courseId }: Props) {
  const { isModalOpen, selectedOptionId, onCloseModal } = useOptionModal();

  const queryClient = useQueryClient();

  const { data: option, isPending } = useQuery({
    queryKey: ["option", selectedOptionId],
    queryFn: () => getOption(selectedOptionId),
  });

  const { mutateAsync: updateOptionMutation } = useMutation({
    mutationFn: updateOption,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["option", selectedOptionId] });
      queryClient.invalidateQueries({ queryKey: ["options", courseId] });

      onCloseModal();
      toast.success("옵션 수정 완료");

      form.reset();
    },
    onError: () => {
      toast.error("옵션 수정 실패");
    },
  });

  const form = useForm<OptionSchema>({
    resolver: zodResolver(optionSchema),
    defaultValues: {
      name: "",
      originalPrice: undefined,
      discountedPrice: undefined,
    },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    form.reset({
      ...option,
      discountedPrice: option?.discountedPrice ?? undefined,
      maxPurchaseCount: option?.maxPurchaseCount ?? undefined,
    });
  }, [option, isModalOpen]);

  const onSubmit = async (values: OptionSchema) => {
    const processedValues = {
      ...values,
      discountedPrice: values.discountedPrice ?? null,
      maxPurchaseCount: values.maxPurchaseCount ?? null,
    };
    await updateOptionMutation({
      optionId: selectedOptionId ?? "",
      values: processedValues,
    });
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onCloseModal}>
      <DialogContent>
        {isPending ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="size-10 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <DialogHeader>
                <DialogTitle>옵션 수정</DialogTitle>
                <DialogDescription>
                  옵션 이름, 원가, 할인가를 수정할 수 있습니다.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <FormField
                  name="name"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>옵션명</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="originalPrice"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>원가</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isSubmitting}
                          type="number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="discountedPrice"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>할인가</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isSubmitting}
                          type="number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* 세금 설정 */}
                <FormField
                  name="isTaxFree"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="space-y-0 flex items-center justify-between">
                      <div className="space-y-1">
                        <FormLabel>세금 설정</FormLabel>
                        <FormDescription>
                          활성화하면 면세 상품으로 처리됩니다.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* 최대 구매 가능 수량 */}
                <FormField
                  name="maxPurchaseCount"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>최대 구매 가능 수량</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isSubmitting}
                          type="number"
                        />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        입력하지 않으면 구매제한이 사라집니다.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit">옵션 수정</Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
