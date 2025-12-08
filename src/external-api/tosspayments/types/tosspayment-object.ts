export interface TossPayment {
  version: string; // Payment 객체의 응답 버전
  paymentKey: string; // 결제의 고유 키 (최대 200자)
  type: "NORMAL" | "BILLING" | "BRANDPAY"; // 결제 타입
  orderId: string; // 주문번호 (6자 이상, 64자 이하)
  orderName: string; // 구매상품명 (최대 100자)
  mId: string; // 상점 ID (최대 14자)
  currency: "KRW" | "USD" | "JPY" | string; // 통화 코드
  method:
    | "카드"
    | "가상계좌"
    | "간편결제"
    | "휴대폰"
    | "계좌이체"
    | "문화상품권"
    | "도서문화상품권"
    | "게임문화상품권" // 결제 수단
    | null;
  totalAmount: number; // 총 결제 금액
  balanceAmount: number; // 취소할 수 있는 금액
  suppliedAmount: number; // 공급가액
  vat: number | null; // 부가세
  taxFreeAmount: number; // 면세 금액
  taxExemptionAmount: number; // 과세 제외 금액
  status:
    | "READY"
    | "IN_PROGRESS"
    | "WAITING_FOR_DEPOSIT"
    | "DONE"
    | "CANCELED"
    | "PARTIAL_CANCELED"
    | "ABORTED"
    | "EXPIRED"; // 결제 상태
  requestedAt: string; // 요청 일시 (ISO8601)
  approvedAt: string | null; // 승인 일시 (ISO8601)
  useEscrow: boolean; // 에스크로 사용 여부
  lastTransactionKey: string | null; // 마지막 거래 키 (최대 64자)
  cancels: Cancel[] | null; // 결제 취소 이력
  isPartialCancelable: boolean; // 분할 결제 취소 가능 여부
  card: Card | null; // 카드 결제 정보
  virtualAccount: VirtualAccount | null; // 가상계좌 정보
  secret: string | null;
  mobilePhone: MobilePhone | null; // 휴대폰 결제 정보
  giftCertificate: GiftCertificate | null; // 상품권 결제 정보
  transfer: Transfer | null; // 계좌이체 정보
  metadata: Record<string, string> | null; // 추가 메타데이터
  receipt: Receipt | null; // 영수증 정보
  checkout: Checkout | null; // 결제창 정보
  easyPay: EasyPay | null; // 간편결제 정보
  country: string; // 결제 국가 (ISO-3166 국가 코드)
  failure: Failure | null; // 결제 실패 정보
  cashReceipt: CashReceipt | null; // 현금영수증 정보
  discount: Discount | null; // 할인 정보
}

export interface Cancel {
  cancelAmount: number; // 취소 금액
  cancelReason: string; // 취소 사유
  taxFreeAmount: number; // 면세 취소 금액
  taxExemptionAmount: number; // 과세 제외 취소 금액
  refundableAmount: number; // 환불 가능한 잔액
  transferDiscountAmount: number; // 즉시할인 취소 금액
  easyPayDiscountAmount: number; // 간편결제 취소 금액
  canceledAt: string; // 취소 일시 (ISO8601)
  transactionKey: string; // 취소 거래 키
  receiptKey: string | null; // 현금영수증 키
  cancelStatus: "DONE"; // 취소 상태
  cancelRequestId: string | null; // 취소 요청 ID
}

export interface Card {
  amount: number; // 결제 요청 금액
  issuerCode: string; // 카드 발급사 코드
  acquirerCode: string | null; // 카드 매입사 코드
  number: string; // 카드번호 (마스킹 처리)
  installmentPlanMonths: number; // 할부 개월 수
  approveNo: string; // 승인 번호
  useCardPoint: boolean; // 카드 포인트 사용 여부
  cardType: "신용" | "체크" | "기프트" | "미확인"; // 카드 종류
  ownerType: "개인" | "법인" | "미확인"; // 소유자 유형
  acquireStatus:
    | "READY"
    | "REQUESTED"
    | "COMPLETED"
    | "CANCEL_REQUESTED"
    | "CANCELED"; // 매입 상태
  isInterestFree: boolean; // 무이자 여부
  interestPayer: "BUYER" | "CARD_COMPANY" | "MERCHANT" | null; // 할부 수수료 부담 주체
}

export interface VirtualAccount {
  accountType: "일반" | "고정"; // 계좌 타입
  accountNumber: string; // 계좌번호
  bankCode: string; // 은행 코드
  customerName: string; // 고객명
  dueDate: string; // 입금 기한 (ISO8601)
  refundStatus: "NONE" | "PENDING" | "FAILED" | "PARTIAL_FAILED" | "COMPLETED"; // 환불 상태
  expired: boolean; // 만료 여부
  settlementStatus: "INCOMPLETED" | "COMPLETED"; // 정산 상태
  refundReceiveAccount: {
    bankCode: string; // 환불 은행 코드
    accountNumber: string; // 환불 계좌번호
    holderName: string; // 예금주 이름
  } | null;
}

export interface MobilePhone {
  customerMobilePhone: string; // 고객 휴대폰 번호
  settlementStatus: "INCOMPLETED" | "COMPLETED"; // 정산 상태
  receiptUrl: string; // 영수증 URL
}

export interface GiftCertificate {
  approveNo: string; // 승인 번호
  settlementStatus: "INCOMPLETED" | "COMPLETED"; // 정산 상태
}

export interface Transfer {
  bankCode: string; // 은행 코드
  settlementStatus: "INCOMPLETED" | "COMPLETED"; // 정산 상태
}

export interface Receipt {
  url: string; // 영수증 URL
}

export interface Checkout {
  url: string; // 결제창 URL
}

export interface EasyPay {
  provider: string; // 간편결제사 코드
  amount: number; // 간편결제 금액
  discountAmount: number; // 할인 금액
}

export interface Failure {
  code: string; // 실패 코드
  message: string; // 실패 메시지
}

export interface CashReceipt {
  type: "소득공제" | "지출증빙"; // 현금영수증 종류
  receiptKey: string; // 현금영수증 키
  issueNumber: string; // 발행 번호
  receiptUrl: string; // 영수증 URL
  amount: number; // 처리 금액
  taxFreeAmount: number; // 면세 금액
}

export interface Discount {
  amount: number; // 할인 금액
}
