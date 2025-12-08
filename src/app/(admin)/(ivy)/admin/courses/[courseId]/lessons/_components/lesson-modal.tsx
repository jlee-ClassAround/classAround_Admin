"use client";

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LessonSchema, lessonSchema } from "@/validations/schemas";
import { useCourseEditorStore } from "@/store/use-course-editor-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { postLesson } from "../actions/post-lesson";

export function LessonModal() {
  const {
    chapters,
    isLessonModalOpened,
    closeLessonModal,
    selectedChapterIndex,
  } = useCourseEditorStore();

  const queryClient = useQueryClient();
  const { mutate: mutatePostLesson } = useMutation({
    mutationFn: postLesson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-chapters"] });
    },
  });

  const ChapterData =
    typeof selectedChapterIndex === "number"
      ? chapters[selectedChapterIndex]
      : null;

  const form = useForm<LessonSchema>({
    resolver: zodResolver(lessonSchema),
  });

  useEffect(() => {
    form.reset({
      title: "",
    });
  }, [ChapterData]);

  const onSubmit = async (values: LessonSchema) => {
    try {
      mutatePostLesson({ chapterId: ChapterData?.id || "", values });

      closeLessonModal();
      toast.success("수업이 생성되었습니다.");
    } catch {
      toast.error("처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <Dialog open={isLessonModalOpened} onOpenChange={closeLessonModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>수업</DialogTitle>
          <DialogDescription>수업 정보를 입력해주세요.</DialogDescription>
        </DialogHeader>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                name="title"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>수업 제목</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="수업 제목을 입력해주세요."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose onClick={closeLessonModal} asChild>
                  <Button type="button" variant="secondary">
                    취소
                  </Button>
                </DialogClose>
                <Button type="submit">저장</Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
