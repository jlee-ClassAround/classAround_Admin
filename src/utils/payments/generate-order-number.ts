/**
 * 주문번호 생성 함수
 * 형식: YYMMDDHHMMSSmmm (25년 7월 31일 14시 28분 59초 486마이크로초)
 * 예시: 250731142859486
 */
export function generateOrderNumber(): string {
  const now = new Date();

  // 년도 (2자리)
  const year = now.getFullYear().toString().slice(-2);

  // 월 (2자리, 01-12)
  const month = (now.getMonth() + 1).toString().padStart(2, "0");

  // 일 (2자리, 01-31)
  const day = now.getDate().toString().padStart(2, "0");

  // 시 (2자리, 00-23)
  const hour = now.getHours().toString().padStart(2, "0");

  // 분 (2자리, 00-59)
  const minute = now.getMinutes().toString().padStart(2, "0");

  // 초 (2자리, 00-59)
  const second = now.getSeconds().toString().padStart(2, "0");

  // 마이크로초 (3자리, 000-999)
  const millisecond = now.getMilliseconds().toString().padStart(3, "0");

  return `${year}${month}${day}${hour}${minute}${second}${millisecond}`;
}
