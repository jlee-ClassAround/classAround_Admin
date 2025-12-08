export type TossPaymentCashReceipt = {
  /** 발급 혹은 취소 요청한 현금영수증 한 건을 특정하는 키값 (최대 200자) */
  receiptKey: string;
  /** 현금영수증 발급번호 (최대 9자) */
  issueNumber: string;
  /** 현금영수증 발급 상태 */
  issueStatus: "IN_PROGRESS" | "COMPLETED" | "FAILED";
  /** 현금영수증 처리된 금액 */
  amount: number;
  /** 면세 처리된 금액 */
  taxFreeAmount: number;
  /** 주문번호 (6-64자, 영문 대소문자, 숫자, 특수문자 -, _) */
  orderId: string;
  /** 구매상품명 (최대 100자) */
  orderName: string;
  /** 현금영수증 종류 */
  type: "소득공제" | "지출증빙";
  /** 현금영수증 발급 종류 */
  transactionType: "CONFIRM" | "CANCEL";
  /** 현금영수증 발급 사업자등록번호 (10자) */
  businessNumber: string;
  /** 현금영수증 발급 주체 식별번호 (최대 30자) */
  customerIdentityNumber: string;
  /** 결제 실패 정보 */
  failure: {
    /** 오류 타입을 보여주는 에러 코드 */
    code: string;
    /** 에러 메시지 (최대 510자) */
    message: string;
  } | null;
  /** 현금영수증 발급/취소 요청 시간 (ISO 8601 형식) */
  requestedAt: string;
  /** 발행된 현금영수증 확인 URL */
  receiptUrl: string;
};
