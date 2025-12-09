"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  data: {
    username: string;
    email: string;
    phone: string;
    appliedAt: Date;
    optedIn: boolean;
  }[];
}

export function DownloadButton({ data }: Props) {
  const handleDownload = () => {
    const filename = `apply-${new Date().toISOString().split("T")[0]}`;
    downloadCSV(data, filename);
  };

  return (
    <Button onClick={handleDownload} variant="outline" size="sm">
      데이터 다운로드
    </Button>
  );
}

function downloadCSV(data: Props["data"], filename: string) {
  const headers = ["이름", "이메일", "전화번호", "신청일", "수신동의여부"];
  const csvData = data.map((item) => [
    item.username,
    item.email,
    item.phone,
    item.appliedAt.toLocaleString("ko-KR"),
    item.optedIn ? "동의" : "미동의",
  ]);

  const csvContent = [
    headers.join(","),
    ...csvData.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("hidden", "");
  a.setAttribute("href", url);
  a.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  toast.success("CSV 파일이 다운로드되었습니다.");
}
