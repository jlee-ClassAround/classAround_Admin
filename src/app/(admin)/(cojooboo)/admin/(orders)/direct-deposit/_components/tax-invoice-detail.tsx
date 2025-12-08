"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TaxInvoiceDetail() {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setTimeout(() => setIsPrinting(false), 500);
  };

  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split("T")[0];
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");

  return (
    <div className="hometax-printer w-full max-w-5xl mx-auto">
      <div className={cn("paper bg-background", isPrinting && "printing")}>
        <div className="print-border-0 border border-foreground/20">
          <table className="w-full border-collapse">
            <tbody>
              <tr className="bg-foreground/5">
                <td
                  colSpan={4}
                  className="w-[50%] p-4 text-xl font-bold border-r border-border"
                >
                  전자세금계산서
                </td>
                <td
                  colSpan={1}
                  className="w-[12.5%] p-3 font-semibold text-foreground/70 border-r border-border"
                >
                  승인번호
                </td>
                <td colSpan={3} className="w-[37.5%] p-3 font-medium">
                  test_nts-_QECBPQP-RDE2M7JS
                </td>
              </tr>
              <tr>
                <td
                  colSpan={4}
                  className="p-2 font-semibold text-center border-r border-border bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200"
                >
                  공급자
                </td>
                <td
                  colSpan={4}
                  className="p-2 font-semibold text-center bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200"
                >
                  공급받는자
                </td>
              </tr>
              <tr>
                <td className="p-2 border-t border-r border-border bg-red-100 text-red-700 w-[100px] dark:bg-red-950 dark:text-red-200">
                  등록번호
                </td>
                <td className="p-2 border-t border-r border-border w-[200px] whitespace-nowrap text-left">
                  266-81-03979
                </td>
                <td className="p-2 border-t border-r border-border bg-red-100 text-red-700 w-[100px] dark:bg-red-950 dark:text-red-200">
                  종사업장
                  <br />
                  번호
                </td>
                <td className="p-2 border-t border-r border-border w-[200px]"></td>
                <td className="p-2 border-t border-r border-border bg-blue-100 text-blue-700 w-[100px] dark:bg-blue-950 dark:text-blue-200">
                  등록번호
                </td>
                <td className="p-2 border-t border-r border-border w-[200px] whitespace-nowrap text-left">
                  409-86-55803
                </td>
                <td className="p-2 border-t border-r border-border bg-blue-100 text-blue-700 w-[100px] dark:bg-blue-950 dark:text-blue-200">
                  종사업장
                  <br />
                  번호
                </td>
                <td className="p-2 border-t w-[200px]"></td>
              </tr>
              <tr>
                <td className="p-2 border-t border-r border-border bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200">
                  상호
                </td>
                <td className="p-2 border-t border-r border-border text-left">
                  주식회사 시스템노바
                </td>
                <td className="p-2 border-t border-r border-border bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200">
                  성명
                </td>
                <td className="p-2 border-t border-r border-border text-left">
                  오윤록
                </td>
                <td className="p-2 border-t border-r border-border bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                  상호
                </td>
                <td className="p-2 border-t border-r border-border text-left">
                  주식회사 타이탄컴퍼니
                </td>
                <td className="p-2 border-t border-r border-border bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                  성명
                </td>
                <td className="p-2 border-t text-left">오윤록</td>
              </tr>
              <tr>
                <td className="p-2 border-t border-r border-border bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200">
                  사업장 주소
                </td>
                <td
                  colSpan={3}
                  className="p-2 border-t border-r border-border text-left"
                >
                  서울특별시 중구 퇴계로51길 20, 지하2층 04호(오장동,
                  넥서스타워)
                </td>
                <td className="p-2 border-t border-r border-border bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                  사업장 주소
                </td>
                <td colSpan={3} className="p-2 border-t text-left">
                  서울시
                </td>
              </tr>
              <tr>
                <td className="p-2 border-t border-r border-border bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200">
                  업태
                </td>
                <td className="p-2 border-t border-r border-border text-left">
                  정보통신업
                </td>
                <td className="p-2 border-t border-r border-border bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200">
                  종목
                </td>
                <td className="p-2 border-t border-r border-border text-left">
                  응용 소프트웨어 개발 및 공급업
                </td>
                <td className="p-2 border-t border-r border-border bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                  업태
                </td>
                <td className="p-2 border-t border-r border-border text-left">
                  도매 및 소매업
                </td>
                <td className="p-2 border-t border-r border-border bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                  종목
                </td>
                <td className="p-2 border-t text-left">전자상거래</td>
              </tr>
              <tr>
                <td className="p-2 border-t border-r border-border bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200">
                  이메일
                </td>
                <td
                  colSpan={3}
                  className="p-2 border-t border-r border-border text-left"
                >
                  hr@systemnova.co.kr
                </td>
                <td className="p-2 border-t border-r border-border bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                  이메일
                </td>
                <td colSpan={3} className="p-2 border-t text-left">
                  <div className="flex flex-col gap-0.5">
                    <div>hr@titan.co.kr</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="print-border-0 border border-t-0 border-foreground/20">
          <table className="w-full border-collapse">
            <tbody>
              <tr className="bg-foreground/5">
                <td className="p-2 border-r border-border text-center font-medium">
                  작성일자
                </td>
                <td className="p-2 border-r border-border text-center font-medium">
                  공급가액
                </td>
                <td className="p-2 border-r border-border text-center font-medium">
                  세액
                </td>
                <td className="p-2 border-r border-border text-center font-medium">
                  수정사유
                </td>
                <td className="p-2 text-center font-medium">비고</td>
              </tr>
              <tr>
                <td className="p-2 border-t border-r border-border text-center">
                  {formattedDate}
                </td>
                <td className="p-2 border-t border-r border-border text-center">
                  454
                </td>
                <td className="p-2 border-t border-r border-border text-center">
                  45
                </td>
                <td className="p-2 border-t border-r border-border text-center"></td>
                <td className="p-2 border-t text-center w-3/12"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="print-border-0 border border-t-0 border-foreground/20">
          <table className="w-full border-collapse">
            <tbody>
              <tr className="bg-foreground/5">
                <td className="p-2 border-r border-border text-center font-medium">
                  월
                </td>
                <td className="p-2 border-r border-border text-center font-medium">
                  일
                </td>
                <td className="p-2 border-r border-border text-left font-medium">
                  품목
                </td>
                <td className="p-2 border-r border-border text-center font-medium">
                  규격
                </td>
                <td className="p-2 border-r border-border text-center font-medium">
                  수량
                </td>
                <td className="p-2 border-r border-border text-center font-medium">
                  단가
                </td>
                <td className="p-2 border-r border-border text-center font-medium">
                  공급가액
                </td>
                <td className="p-2 border-r border-border text-center font-medium">
                  세액
                </td>
                <td className="p-2 text-center font-medium">비고</td>
              </tr>
              <tr>
                <td className="p-2 border-t border-r border-border text-center">
                  {month}
                </td>
                <td className="p-2 border-t border-r border-border text-center">
                  {day}
                </td>
                <td className="p-2 border-t border-r border-border text-left">
                  대박나는 강의
                </td>
                <td className="p-2 border-t border-r border-border text-center"></td>
                <td className="p-2 border-t border-r border-border text-center"></td>
                <td className="p-2 border-t border-r border-border text-center"></td>
                <td className="p-2 border-t border-r border-border text-center">
                  454
                </td>
                <td className="p-2 border-t border-r border-border text-center">
                  45
                </td>
                <td className="p-2 border-t text-center max-w-[176px]"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="print-border-0 border border-t-0 border-foreground/20">
          <table className="w-full border-collapse">
            <tbody>
              <tr className="bg-foreground/5">
                <td className="p-2 border-r border-border text-center font-medium">
                  합계금액
                </td>
                <td className="p-2 border-r border-border text-center font-medium">
                  현금
                </td>
                <td className="p-2 border-r border-border text-center font-medium">
                  수표
                </td>
                <td className="p-2 border-r border-border text-center font-medium">
                  어음
                </td>
                <td className="p-2 border-r border-border text-center font-medium">
                  외상미수금
                </td>
                <td
                  rowSpan={2}
                  className="p-2 border-l border-border w-[28%] bg-background text-center align-middle"
                >
                  이 금액을 (영수) 함
                </td>
              </tr>
              <tr>
                <td className="p-2 border-t border-r border-border text-center">
                  499
                </td>
                <td className="p-2 border-t border-r border-border text-center"></td>
                <td className="p-2 border-t border-r border-border text-center"></td>
                <td className="p-2 border-t border-r border-border text-center"></td>
                <td className="p-2 border-t border-r border-border text-center"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="no-print mt-4 text-right">
          <Button onClick={handlePrint} variant="secondary" className="gap-2">
            <Printer className="h-4 w-4" />
            출력하기
          </Button>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .paper,
          .paper * {
            visibility: visible;
          }
          .no-print {
            display: none;
          }
          .print-only {
            display: block;
          }
          .paper {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
        }
        @media screen {
          .print-only {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
