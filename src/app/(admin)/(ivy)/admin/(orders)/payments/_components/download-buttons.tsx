"use client";

import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { downloadAllPayments } from "../_actions/download-all-payments";
import { downloadFilteredPayments } from "../_actions/download-filtered-payments";
import { PaymentFilterParams } from "../_queries/build-payment-filters";

interface DownloadButtonsProps {
  filterParams: PaymentFilterParams;
}

export function DownloadButtons({ filterParams }: DownloadButtonsProps) {
  const [isDownloadingFiltered, setIsDownloadingFiltered] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const handleDownloadFiltered = async () => {
    setIsDownloadingFiltered(true);
    try {
      const result = await downloadFilteredPayments(filterParams);

      if (result.success && result.data) {
        // Base64 데이터를 바이너리로 변환
        const binaryString = atob(result.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // 파일 다운로드
        const blob = new Blob([bytes], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `결제내역_필터링_${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("다운로드 오류:", error);
      alert("다운로드 중 오류가 발생했습니다.");
    } finally {
      setIsDownloadingFiltered(false);
    }
  };

  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    try {
      const result = await downloadAllPayments();

      if (result.success && result.data) {
        // Base64 데이터를 바이너리로 변환
        const binaryString = atob(result.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // 파일 다운로드
        const blob = new Blob([bytes], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `결제내역_전체_${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("다운로드 오류:", error);
      alert("다운로드 중 오류가 발생했습니다.");
    } finally {
      setIsDownloadingAll(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleDownloadFiltered}
        disabled={isDownloadingFiltered || isDownloadingAll}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        {isDownloadingFiltered ? "다운로드 중..." : "필터링된 데이터 다운로드"}
      </Button>

      <Button
        onClick={handleDownloadAll}
        disabled={isDownloadingFiltered || isDownloadingAll}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <FileSpreadsheet className="h-4 w-4" />
        {isDownloadingAll ? "다운로드 중..." : "전체 데이터 다운로드"}
      </Button>
    </div>
  );
}
