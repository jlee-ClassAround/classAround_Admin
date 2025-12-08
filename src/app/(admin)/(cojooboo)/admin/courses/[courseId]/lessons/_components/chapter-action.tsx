"use client";

import { useCourseEditorStore } from "@/store/use-course-editor-store";
import { Loader2, Plus } from "lucide-react";
import { ChapterDragDrop } from "./chapter-drag-drop";
import { Chapter, Lesson } from "@prisma/client";
import { useEffect } from "react";
import { ChapterModal } from "./chapter-modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCourseChapters } from "@/actions/courses/get-course-with-chapters";
import { LessonModal } from "./lesson-modal";
import { reorderChapters } from "../actions/reorder-chapters";
import { toast } from "sonner";

interface Props {
  courseId: string;
  chapters: (Chapter & {
    lessons: Lesson[];
  })[];
}

export function ChapterAction({ courseId, chapters }: Props) {
  const { setChapters, openChapterModal } = useCourseEditorStore();

  const { data } = useQuery({
    queryKey: ["course-chapters"],
    queryFn: () => getCourseChapters(courseId),
    initialData: chapters,
  });

  const queryClient = useQueryClient();
  const { mutate: mutateReorderChapters, isPending } = useMutation({
    mutationFn: reorderChapters,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-chapters"] });
    },
  });

  useEffect(() => {
    setChapters(data);
  }, [data, setChapters]);

  const onReorder = (updatedData: { id: string; position: number }[]) => {
    try {
      mutateReorderChapters({ chapterList: updatedData });
      toast.success("순서가 변경되었습니다.");
    } catch {
      toast.error("처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="relative">
      {isPending && (
        <div className="w-full h-full bg-black/40 flex items-center justify-center absolute top-0 left-0 rounded-md cursor-not-allowed z-10">
          <Loader2 className="size-10 text-gray-200 animate-spin" />
        </div>
      )}
      <div className="border rounded-md p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-medium text-sm">강의 챕터</label>
          <button
            type="button"
            className="text-xs flex items-center gap-1 font-medium text-slate-600 hover:text-primary transition-colors"
            onClick={() => openChapterModal()}
          >
            <Plus className="size-4" />
            챕터 추가하기
          </button>
        </div>
        <ChapterDragDrop courseId={courseId} onReorder={onReorder} />
        <div className="text-xs text-slate-500">
          강의 커리큘럼을 추가해보세요.
        </div>
      </div>
      <ChapterModal chapters={data} courseId={courseId} />
      <LessonModal />
    </div>
  );
}
