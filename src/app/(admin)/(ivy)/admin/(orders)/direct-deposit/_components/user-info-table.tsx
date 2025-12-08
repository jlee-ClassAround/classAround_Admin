import {
  getBillingTypeToKr,
  getCashReceiptTypeToKr,
} from "@/utils/payments/get-enum-to-kr";
import { BillingSnapshot } from "@prisma/client";

interface Props {
  billingSnapshot: BillingSnapshot | null;
}

export function UserInfoTable({ billingSnapshot }: Props) {
  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-1">청구서 유형</div>
        <div className="col-span-2">
          {getBillingTypeToKr(billingSnapshot?.billingType || null)}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-1">현금영수증 유형</div>
        <div className="col-span-2">
          {getCashReceiptTypeToKr(billingSnapshot?.cashReceiptType || null)}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-1">발행번호</div>
        <div className="col-span-2">
          {billingSnapshot?.receiptNumber || "-"}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-1">예금주명</div>
        <div className="col-span-2">{billingSnapshot?.depositorName}</div>
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-1">비고</div>
        <div className="col-span-2">{billingSnapshot?.note || "-"}</div>
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-1">사업자등록번호</div>
        <div className="col-span-2">
          {billingSnapshot?.businessNumber || "-"}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-1">사업자명</div>
        <div className="col-span-2">{billingSnapshot?.companyName || "-"}</div>
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-1">대표자명</div>
        <div className="col-span-2">{billingSnapshot?.ceoName || "-"}</div>
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-1">사업자 주소</div>
        <div className="col-span-2">
          {billingSnapshot?.businessAddress || "-"}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-1">사업자 종목</div>
        <div className="col-span-2">{billingSnapshot?.businessType || "-"}</div>
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-1">사업자 업태</div>
        <div className="col-span-2">{billingSnapshot?.businessItem || "-"}</div>
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-1">담당자명</div>
        <div className="col-span-2">{billingSnapshot?.contactName || "-"}</div>
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-1">담당자 전화번호</div>
        <div className="col-span-2">{billingSnapshot?.contactPhone || "-"}</div>
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-1">담당자 이메일</div>
        <div className="col-span-2">{billingSnapshot?.contactEmail || "-"}</div>
      </div>
    </div>
  );
}
