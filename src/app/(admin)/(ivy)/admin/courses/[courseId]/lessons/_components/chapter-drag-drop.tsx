"use client";

import { useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
  DraggableProvided,
} from "@hello-pangea/dnd";
import { Edit, GripVertical, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  ChapterType,
  useCourseEditorStore,
} from "@/store/use-course-editor-store";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteChapter } from "../actions/delete-chapter";
import { editChapter } from "../actions/edit-chapter";
import { useRouter } from "next/navigation";
import { editLesson } from "../actions/edit-lesson";
import { deleteLesson } from "../actions/delete-lesson";
import { reorderLessons } from "../actions/reorder-lessons";

interface Props {
  courseId: string;
  onReorder: (chapterList: { id: string; position: number }[]) => void;
}
export function ChapterDragDrop({ courseId, onReorder }: Props) {
  const { chapters, setChapters, openLessonModal } = useCourseEditorStore();

  const queryClient = useQueryClient();
  const { mutate: mutateReorderLessons, isPending } = useMutation({
    mutationFn: reorderLessons,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-chapters"] });
    },
  });

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  if (!isClient) return null;

  const onChapterDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newChapters = [...chapters];
    const [reorderedChapter] = newChapters.splice(result.source.index, 1);
    newChapters.splice(result.destination.index, 0, reorderedChapter);

    setChapters(newChapters);

    const startIndex = Math.min(result.source.index, result.destination.index);
    const endIndex = Math.max(result.source.index, result.destination.index);

    const updatedChapters = newChapters.slice(startIndex, endIndex + 1);

    const bulkUpdateData = updatedChapters.map((chapter) => ({
      id: chapter.id,
      position: newChapters.findIndex((item) => item.id === chapter.id) + 1,
    }));

    onReorder(bulkUpdateData);
  };

  const onLessonReorder = (lessonList: { id: string; position: number }[]) => {
    try {
      mutateReorderLessons({ lessonList });
      toast.success("순서가 변경되었습니다.");
    } catch {
      toast.error("처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <DragDropContext onDragEnd={onChapterDragEnd}>
      <Droppable droppableId="chapters">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-2"
          >
            {chapters.map((chapter, chapterIndex) => (
              <Draggable
                key={chapter.id}
                index={chapterIndex}
                draggableId={chapter.id}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="border p-3 rounded-md space-y-2 bg-slate-50 relative overflow-hidden"
                  >
                    {isPending && (
                      <div className="absolute top-0 left-0 w-full h-full bg-black/40 flex items-center justify-center">
                        <Loader2 className="size-10 text-gray-300 animate-spin" />
                      </div>
                    )}
                    <ChapterHeader
                      chapterProvider={provided}
                      chapter={chapter}
                      chapterIndex={chapterIndex}
                    />
                    <div className="pl-2">
                      <LessonDragDropContext
                        courseId={courseId}
                        chapter={chapter}
                        chapterIndex={chapterIndex}
                        onReorder={onLessonReorder}
                      />
                    </div>
                    <button
                      type="button"
                      className="text-xs text-slate-600 hover:text-primary transition-colors flex items-center gap-1"
                      onClick={() => openLessonModal(chapterIndex)}
                    >
                      <Plus className="size-4" />
                      수업 추가하기
                    </button>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

function ChapterHeader({
  chapterProvider,
  chapter,
  chapterIndex,
}: {
  chapterProvider: DraggableProvided;
  chapter: ChapterType;
  chapterIndex: number;
}) {
  const { openChapterModal } = useCourseEditorStore();

  const queryClient = useQueryClient();
  const { mutate: mutateDeleteChapter } = useMutation({
    mutationFn: deleteChapter,
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

  const onDeleteChapter = () => {
    try {
      if (
        !confirm("정말로 삭제하시겠습니까? 삭제된 정보는 되돌릴 수 없습니다.")
      )
        return;

      mutateDeleteChapter({ chapterId: chapter.id });
      toast.success("삭제되었습니다.");
    } catch {
      toast.error("처리 중 오류가 발생했습니다.");
    }
  };

  const onChagePublish = (e: string) => {
    try {
      const values = {
        isPublished: e === "publish" ? true : false,
      };
      mutateEditChapter({ chapterId: chapter.id, values });

      toast.success("상태가 변경되었습니다.");
    } catch {
      toast.error("처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1 min-w-0">
        <div
          {...chapterProvider.dragHandleProps}
          className="hover:text-primary transition-colors"
        >
          <GripVertical className="size-5" />
        </div>
        <h3 className="text-[15px] font-medium truncate">{chapter.title}</h3>
      </div>
      <div className="flex items-center gap-1">
        <Select
          onValueChange={onChagePublish}
          defaultValue={chapter.isPublished ? "publish" : "draft"}
        >
          <SelectTrigger
            className={cn(
              "w-auto border-none shadow-none h-auto rounded-full py-1 px-2",
              chapter.isPublished
                ? "text-green-600 bg-green-100"
                : "text-gray-700 bg-gray-200"
            )}
          >
            <SelectValue placeholder="공개 여부를 설정해주세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">
              <span className="bg-gray-200 text-gray-700 rounded-full py-1 px-3 text-xs font-medium w-auto">
                비공개
              </span>
            </SelectItem>
            <SelectItem value="publish">
              <span className="text-green-600 bg-green-100 rounded-full py-1 px-3 text-xs font-medium w-auto">
                공개
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="text-slate-600 hover:text-primary transition-colors"
          onClick={() => openChapterModal(chapterIndex)}
        >
          <Edit />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="text-slate-600 hover:text-primary transition-colors"
          onClick={onDeleteChapter}
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  );
}

function LessonDragDropContext({
  courseId,
  chapter,
  chapterIndex,
  onReorder,
}: {
  courseId: string;
  chapter: ChapterType;
  chapterIndex: number;
  onReorder: (list: { id: string; position: number }[]) => void;
}) {
  const router = useRouter();
  const { chapters, setChapters } = useCourseEditorStore();

  const queryClient = useQueryClient();
  const { mutate: mutateEditLesson } = useMutation({
    mutationFn: editLesson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-chapters"] });
    },
  });
  const { mutateAsync: mutateDeleteLesson } = useMutation({
    mutationFn: deleteLesson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-chapters"] });
    },
  });

  const onLessonDragEnd = (result: DropResult, chapterIndex: number) => {
    if (!result.destination) return;

    const newChapters = [...chapters];
    const newLessons = [...newChapters[chapterIndex].lessons];
    const [reorderedLesson] = newLessons.splice(result.source.index, 1);
    newLessons.splice(result.destination.index, 0, reorderedLesson);
    newChapters[chapterIndex].lessons = newLessons;

    setChapters(newChapters);

    const startIndex = Math.min(result.source.index, result.destination.index);
    const endIndex = Math.max(result.source.index, result.destination.index);

    const updatedLessons = newLessons.slice(startIndex, endIndex + 1);

    const bulkUpdateData = updatedLessons.map((item) => ({
      id: item.id,
      position: newLessons.findIndex((lesson) => lesson.id === item.id) + 1,
    }));

    onReorder(bulkUpdateData);
  };

  const onChangePublish = (e: string, lessonId: string) => {
    try {
      mutateEditLesson({
        lessonId,
        values: {
          isPublished: e === "publish" ? true : false,
        },
      });
      toast.success("정상적으로 변경되었습니다.");
    } catch {
      toast.error("처리 중 오류가 발생했습니다.");
    }
  };

  const onDeleteLesson = async (lessonId: string) => {
    try {
      if (
        !confirm(
          "정말 삭제하시겠습니까? 유저의 수업 진행현황이 모두 삭제됩니다. 삭제 후에는 되돌릴 수 없습니다."
        )
      ) {
        return;
      }

      await mutateDeleteLesson({ lessonId });
      toast.success("삭제되었습니다.");
    } catch {
      toast.error("처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <DragDropContext
      onDragEnd={(result) => onLessonDragEnd(result, chapterIndex)}
    >
      <Droppable droppableId={`lessons-${chapter.id}`}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-1"
          >
            {chapter.lessons.map((lesson, lessonIndex) => (
              <Draggable
                key={lesson.id}
                index={lessonIndex}
                draggableId={lesson.id}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="border rounded-md p-1 bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 min-w-0">
                        <div
                          {...provided.dragHandleProps}
                          className="hover:text-primary transition-colors"
                        >
                          <GripVertical className="size-4" />
                        </div>
                        <h4 className="text-sm truncate">{lesson.title}</h4>
                      </div>
                      <div className="flex items-center gap-0">
                        <Select
                          onValueChange={(e) => onChangePublish(e, lesson.id)}
                          defaultValue={
                            lesson.isPublished ? "publish" : "draft"
                          }
                        >
                          <SelectTrigger
                            className={cn(
                              "w-auto border-none shadow-none h-auto rounded-full py-1 px-1 text-xs mr-2",
                              lesson.isPublished
                                ? "text-green-600 bg-green-100"
                                : "text-gray-700 bg-gray-200"
                            )}
                          >
                            <SelectValue placeholder="공개 여부를 설정해주세요" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">
                              <span className="bg-gray-200 text-gray-700 rounded-full py-1 px-3 text-xs font-medium w-auto">
                                비공개
                              </span>
                            </SelectItem>
                            <SelectItem value="publish">
                              <span className="text-green-600 bg-green-100 rounded-full py-1 px-3 text-xs font-medium w-auto">
                                공개
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-slate-600 hover:text-primary transition-colors"
                          onClick={() =>
                            router.push(
                              `/admin/courses/${courseId}/lessons/${lesson.id}`
                            )
                          }
                        >
                          <Edit />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-slate-600 hover:text-primary transition-colors"
                          onClick={() => onDeleteLesson(lesson.id)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
