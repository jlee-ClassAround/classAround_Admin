"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Download, Upload } from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

interface Props {
  handleFileUpload: (file: File) => void;
}

export function FileUploadModal({ handleFileUpload }: Props) {
  const [open, setOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles[0]) {
        handleFileUpload(acceptedFiles[0]);
      }
      setIsDragOver(false);
    },
    onDropAccepted: () => {
      setOpen(false);
    },
    onDropRejected: () => {
      toast.error("파일 업로드에 실패했습니다.");
    },
    onDragEnter: () => {
      setIsDragOver(true);
    },
    onDragLeave: () => {
      setIsDragOver(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          연락처 데이터 파일업로드 (.xlsx , .csv)
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>파일업로드</DialogTitle>
          <DialogDescription className="leading-[1.75]">
            휴대폰번호 데이터의 컬럼이 phone, 전화번호, 연락처, tel 중에 하나로
            설정된 연락처 엑셀파일을 업로드해주세요.
            <br />
            오직 연락처를 기준으로 유저를 검색합니다.
            <br />
            엑셀(.xlsx) 또는 CSV(.csv) 파일을 업로드해주세요.
          </DialogDescription>
        </DialogHeader>
        <div
          className={cn(
            "border-2 border-dashed p-5 rounded-2xl transition cursor-pointer hover:border-primary",
            isDragOver && "border-primary"
          )}
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          <div
            className={cn(
              "flex items-center gap-2 justify-center text-foreground/70 transition",
              isDragOver && "text-primary"
            )}
          >
            {isDragOver ? (
              <>
                <Download className="size-5" />
                <p className="text-sm">여기에 파일을 드롭해주세요.</p>
              </>
            ) : (
              <>
                <Upload className="size-5" />
                <p className="text-sm">파일을 드래그 앤 드랍해주세요.</p>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
