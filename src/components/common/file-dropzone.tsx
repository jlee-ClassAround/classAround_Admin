"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { Download, Loader2, Upload } from "lucide-react";
import Dropzone, { FileRejection } from "react-dropzone";

import { cn } from "@/lib/utils";

import { Progress } from "@/components/ui/progress";
import supabase from "@/lib/supa-client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Props {
  setState?: () => void;
  setPreviewImage?: Dispatch<SetStateAction<string | null>>;
  onChange?: (value: string) => void;
  onDetailImagesUpload?: (
    uploadedFiles: {
      id: string;
      name: string;
      imageUrl: string;
    }[]
  ) => void;
  onUploadComplete?: (name: string, url: string) => void;

  bucket: "images" | "files";
  className?: string;
  accept?: "image" | "pdf" | "all";
  maxSizeMB?: number;
  maxFiles?: number;
}

export function FileDropzone({
  setState,
  setPreviewImage,
  onChange,
  onDetailImagesUpload,
  onUploadComplete,
  bucket,
  className,
  accept = "image",
  maxSizeMB = 2,
  maxFiles = 1,
}: Props) {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const onDropAccepted = async (files: File[]) => {
    try {
      setIsUploading(true);
      toast.info("업로드 중입니다. 잠시만 기다려주세요.");

      let result;
      let uploadedFiles = [];
      for (const file of files) {
        const fileId = uuidv4();
        const fileName = `${bucket.slice(0, -1)}-${fileId}-${format(
          new Date(),
          "yyyy-MM-dd"
        )}`;
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, file);

        if (data) {
          result = data;
          const {
            data: { publicUrl: fileUrl },
          } = supabase.storage.from(bucket).getPublicUrl(data.path);
          uploadedFiles.push({
            id: fileId,
            name: file.name,
            imageUrl: fileUrl,
          });
          if (onUploadComplete) onUploadComplete(fileName, fileUrl);
          if (setPreviewImage) setPreviewImage(fileUrl);
          if (onChange) onChange(fileUrl);
        }
        if (error) {
          console.log(error);
          throw new Error("이미지 업로드에 실패했습니다.");
        }
      }
      if (setState) setState();
      if (onDetailImagesUpload) onDetailImagesUpload(uploadedFiles);

      setIsDragOver(false);
    } catch {
      toast.error("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const onDropRejected = (files: FileRejection[]) => {
    const [item] = files;

    setIsDragOver(false);

    if (files.length > maxFiles) {
      toast.error(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
    } else if (item.file.size > maxSizeMB * 1048576) {
      toast.error(`최대 ${maxSizeMB}MB 파일만 업로드할 수 있습니다.`);
    } else {
      toast.error(`${item.file.type} 파일은 업로드할 수 없습니다.`);
    }
  };

  const maxSize = maxSizeMB * 1048576;

  return (
    <Dropzone
      onDropAccepted={onDropAccepted}
      onDropRejected={onDropRejected}
      onDragEnter={() => setIsDragOver(true)}
      onDragLeave={() => setIsDragOver(false)}
      accept={
        accept === "image"
          ? {
              "image/png": [".png"],
              "image/jpg": [".jpg"],
              "image/jpeg": [".jpeg"],
              "image/webp": [".webp"],
              "image/gif": [".gif"],
            }
          : accept === "pdf"
          ? {
              "application/pdf": [".pdf"],
            }
          : {}
      }
      maxSize={maxSize}
      maxFiles={maxFiles}
    >
      {({ getInputProps, getRootProps }) => (
        <div
          {...getRootProps()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
            isDragOver
              ? "border-primary bg-primary/10"
              : "hover:border-primary border-gray-300",
            className
          )}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center text-sm">
            {isUploading ? (
              <>
                <Loader2 className="size-6 animate-spin text-gray-400" />
                <p className="my-2">업로드중 ...</p>
                {/* <Progress value={uploadProgress} className="h-2 w-[100px]" /> */}
              </>
            ) : isDragOver ? (
              <>
                <Download className="size-6 text-gray-400" />
                <p className="mt-2">파일을 드롭해주세요.</p>
              </>
            ) : (
              <>
                <Upload className="size-6 text-gray-400" />
                <p className="mt-2">
                  파일을 드래그 드롭 하거나 이 곳을 클릭해주세요.
                </p>
              </>
            )}
          </div>

          <p className="mt-2 text-xs text-gray-500">
            {accept === "image"
              ? `JPG, PNG 파일만 가능합니다. 최대용량: ${maxSizeMB}MB`
              : accept === "pdf"
              ? `PDF 파일만 가능합니다. 최대용량: ${maxSizeMB}MB`
              : `최대용량: ${maxSizeMB}MB`}
          </p>
        </div>
      )}
    </Dropzone>
  );
}
