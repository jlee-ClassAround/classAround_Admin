export interface TossPaymentWebhookBody {
  createdAt: string;
  secret: string;
  orderId: string;
  status:
    | "DONE" // 결제 승인 완료 상태
    | "CANCELED" // 결제 취소 상태
    | "PARTIAL_CANCELED" // 결제 부분 취소 상태
    | "ABORTED" // 결제 승인 실패 상태
    | "READY" // 결제 생성 시 초기 상태, 인증 전까지 유지
    | "IN_PROGRESS" // 결제수단 인증 완료 상태, 결제 승인 API 호출 대기
    | "WAITING_FOR_DEPOSIT" // 가상계좌 입금 대기 상태
    | "EXPIRED"; // 결제 유효시간(30분) 초과로 취소된 상태
  transactionKey: string;
}
