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
import { Textarea } from "@/components/ui/textarea";
import { useCourseEditorStore } from "@/store/use-course-editor-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ChapterSchema, chapterSchema } from "@/validations/schemas";
import { Chapter } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { editChapter } from "../actions/edit-chapter";
import { postChapter } from "../actions/post-chapter";
interface Props {
  chapters: Chapter[];
  courseId: string;
}

export function ChapterModal({ chapters, courseId }: Props) {
  const { isChapterModalOpened, closeChapterModal, selectedChapterIndex } =
    useCourseEditorStore();

  const queryClient = useQueryClient();
  const { mutate: mutatePostChapter } = useMutation({
    mutationFn: postChapter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-chapters"] });
    },
  });
  const { mutate: mutateEditChapter } = useMutation({
    mutationFn: editChapter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-chapters"] });
    },
  });

  const chapterData =
    typeof selectedChapterIndex === "number"
      ? chapters[selectedChapterIndex]
      : null;

  const form = useForm<ChapterSchema>({
    resolver: zodResolver(chapterSchema),
  });

  useEffect(() => {
    if (chapterData) {
      form.reset({
        title: chapterData.title,
        description: chapterData.description || "",
      });
    } else {
      form.reset({
        title: "",
        description: "",
      });
    }
  }, [selectedChapterIndex, chapterData]);

  const onSubmit = async (values: ChapterSchema) => {
    try {
      if (!chapterData) {
        mutatePostChapter({ courseId, values });
      } else {
        mutateEditChapter({ chapterId: chapterData.id, values });
      }

      toast.success("저장되었습니다.");
      closeChapterModal();
    } catch {
      toast.error("처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <Dialog open={isChapterModalOpened} onOpenChange={closeChapterModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>챕터</DialogTitle>
          <DialogDescription>챕터 정보를 입력해주세요.</DialogDescription>
        </DialogHeader>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                name="title"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>챕터 제목</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="챕터 제목을 입력해주세요."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="description"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>챕터 설명</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="챕터 설명을 입력해주세요."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose
                  onClick={() => {
                    closeChapterModal();
                    form.reset();
                  }}
                  asChild
                >
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
