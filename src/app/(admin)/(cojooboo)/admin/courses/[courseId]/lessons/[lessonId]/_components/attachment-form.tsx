"use client";

import { FileDropzone } from "@/components/common/file-dropzone";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleX, File, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createAttachment } from "../../actions/create-attachment";
import { deleteAttachment } from "../../actions/delete-attachment";
import { getLessonAttachments } from "../../actions/get-lesson-attachments";

interface Props {
  lessonId: string;
}

export function AttachmentForm({ lessonId }: Props) {
  const [isEditting, setIsEditting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: attachments } = useQuery({
    queryKey: ["lesson-attachments", lessonId],
    queryFn: () => getLessonAttachments(lessonId),
  });

  const queryClient = useQueryClient();
  const { mutate: createAttachmentMutation } = useMutation({
    mutationFn: createAttachment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["lesson-attachments", lessonId],
      });
    },
    onError: () => {
      toast.error("처리 중 오류가 발생했습니다.");
    },
  });

  const { mutate: deleteAttachmentMutation } = useMutation({
    mutationFn: deleteAttachment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["lesson-attachments", lessonId],
      });
    },
    onError: () => {
      toast.error("처리 중 오류가 발생했습니다.");
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  const onUploadComplete = (name: string, url: string) => {
    createAttachmentMutation({ lessonId, name, url });
  };

  const onDeleteAttachment = (attachmentId: string) => {
    setDeletingId(attachmentId);
    deleteAttachmentMutation({ attachmentId });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">수업 자료</label>
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => setIsEditting(!isEditting)}
        >
          {isEditting ? "취소" : "추가"}
        </Button>
      </div>
      <div className="border rounded-lg p-1 flex flex-col gap-y-1">
        {attachments && attachments.length > 0 ? (
          attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-x-2 rounded-md bg-primary/5 p-2"
            >
              <File className="size-4 shrink-0 text-slate-500" />
              <span className="text-sm text-slate-700 truncate">
                {attachment.name}
              </span>
              <div className="ml-auto">
                {deletingId === attachment.id ? (
                  <Loader2 className="size-4 shrink-0 text-slate-500 animate-spin" />
                ) : (
                  <CircleX
                    className="size-4 shrink-0 text-slate-500 cursor-pointer"
                    onClick={() => onDeleteAttachment(attachment.id)}
                  />
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground h-20 flex items-center justify-center">
            수업 자료가 없습니다.
          </div>
        )}
      </div>

      {isEditting && (
        <FileDropzone
          className="p-4 text-center"
          accept="all"
          maxFiles={1}
          maxSizeMB={32}
          bucket="files"
          onUploadComplete={onUploadComplete}
          setState={() => setIsEditting(false)}
        />
      )}
    </div>
  );
}
