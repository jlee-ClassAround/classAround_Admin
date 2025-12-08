"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { User } from "@prisma/client";

interface DownloadCsvButtonProps {
  users: User[];
}

export function DownloadCsvButton({ users }: DownloadCsvButtonProps) {
  const handleDownload = () => {
    // CSV 헤더 정의
    const headers = [
      "ID",
      "사용자명",
      "닉네임",
      "이메일",
      "전화번호",
      "생성일",
    ];

    // 데이터를 CSV 형식으로 변환
    const csvContent = [
      headers.join(","),
      ...users.map((user) =>
        [
          user.id,
          user.username || "",
          user.nickname || "",
          user.email || "",
          user.phone || "",
          user.createdAt.toISOString(),
        ].join(",")
      ),
    ].join("\n");

    // BOM 추가 및 UTF-8 인코딩
    const BOM = "\uFEFF";
    const csvContentWithBOM = BOM + csvContent;

    // Blob 생성 및 다운로드 링크 생성
    const blob = new Blob([csvContentWithBOM], {
      type: "text/csv;charset=utf-8-sig",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `users-${new Date().toISOString()}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      onClick={handleDownload}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      CSV 다운로드
    </Button>
  );
}
