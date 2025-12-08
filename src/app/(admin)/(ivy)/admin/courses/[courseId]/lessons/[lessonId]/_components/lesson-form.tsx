"use client";

import Tiptap from "@/components/tiptap/tiptap";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { videoTypes } from "@/constants/video-types";
import { LessonSchema, lessonSchema } from "@/validations/schemas";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lesson } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { editLesson } from "../../actions/edit-lesson";
import { AttachmentForm } from "./attachment-form";
import { PreviewPlayer } from "./preview-player";

interface Props {
  lesson: Lesson;
  courseId: string;
}

export function LessonForm({ lesson, courseId }: Props) {
  const router = useRouter();
  const [currentVideoType, setCurrentVideoType] = useState<
    | {
        value: string;
        label: string;
        description: string;
        placeholder: string;
      }
    | undefined
  >();

  const queryClient = useQueryClient();
  const { mutateAsync: editLessonMutation, isPending } = useMutation({
    mutationFn: editLesson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-chapters"] });
      toast.success("저장이 완료되었습니다.");
      router.push(`/admin/courses/${courseId}/lessons`);
    },
    onError: () => {
      toast.error("처리 중 오류가 발생했습니다.");
    },
  });

  const form = useForm<LessonSchema>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      ...lesson,
      description: lesson.description || "",
      videoUrl: lesson.videoUrl || "",
    },
  });

  const { isValid } = form.formState;

  const onSubmit = async (values: LessonSchema) => {
    await editLessonMutation({ lessonId: lesson.id, values });
  };

  const checkVideoType = form.watch("videoType");

  useEffect(() => {
    const currentData = videoTypes.find(
      (type) => type.value === checkVideoType
    );
    setCurrentVideoType(currentData);
  }, [checkVideoType]);

  const videoUrl = form.watch("videoUrl");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          <div className="cols-span-1 lg:col-span-5 space-y-4 order-2 lg:order-1">
            <Card className="p-8">
              <div className="space-y-5">
                <FormField
                  name="title"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>수업 제목</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="수업 제목 입력"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        수업 제목을 입력해주세요.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  name="description"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>강의 설명</FormLabel>
                      <FormControl>
                        <Tiptap
                          content={field.value ?? ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        수업 설명을 입력해주세요.
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  name="videoType"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>비디오 형식</FormLabel>
                      <FormControl>
                        <Select
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          disabled={isPending}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="비디오 링크를 입력해주세요." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vimeo">비메오</SelectItem>
                            <SelectItem value="youtube">유튜브</SelectItem>
                            <SelectItem value="custom-video">
                              커스텀 비디오 링크
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        비디오가 업로드된 웹사이트 링크를 입력해주세요.
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  name="videoUrl"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {currentVideoType?.label || "비디오 링크"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            currentVideoType?.placeholder ||
                            "https://videohosting.com/video.mp4"
                          }
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        {currentVideoType?.description ||
                          "비디오가 업로드된 웹사이트 링크를 입력해주세요."}
                      </FormDescription>
                    </FormItem>
                  )}
                />

                {/* 비디오 미리보기 */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">비디오 미리보기</label>
                  <PreviewPlayer
                    videoUrl={videoUrl}
                    videoType={checkVideoType}
                  />
                </div>
              </div>
            </Card>
          </div>
          <div className="space-y-4 cols-span-1 lg:col-span-2 order-1 lg:order-2">
            <Card className="p-8">
              <div className="flex items-center justify-between gap-x-4">
                {/* 공개 설정 */}
                <FormField
                  name="isPublished"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <div
                        className={cn(
                          "text-xs font-medium",
                          field.value ? "text-primary" : "text-slate-400"
                        )}
                      >
                        {field.value ? "공개" : "비공개"}
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isPending}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {/* 저장하기 */}
                <Button type="submit" disabled={isPending || !isValid}>
                  {isPending ? (
                    <>
                      저장중 <Loader2 className="animate-spin" />
                    </>
                  ) : (
                    <>저장</>
                  )}
                </Button>
              </div>
            </Card>
            <Card className="p-8">
              <AttachmentForm lessonId={lesson.id} />
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
