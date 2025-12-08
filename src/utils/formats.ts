export function dateWithoutWeekFormat(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function dateFormat(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
}

export function dateTimeFormat(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "decimal",
  }).format(price);
}

export const formatPhoneNumber = (phone: string) => {
  return phone.replace(/[^0-9]/g, "").slice(0, 11);
};

export const normalizeKRPhoneNumber = (phone: string) => {
  return phone.replace(/[^0-9]/g, "").replace(/^82/, "0");
};

export function checkBusinessNumber(number: string) {
  const numberMap = number
    .replace(/-/gi, "")
    .split("")
    .map((d) => {
      return parseInt(d, 10);
    });

  if (numberMap.length == 10) {
    const keyArr = [1, 3, 7, 1, 3, 7, 1, 3, 5];
    let chk = 0;

    keyArr.forEach((d, i) => {
      chk += d * numberMap[i];
    });

    chk += Math.floor((keyArr[8] * numberMap[8]) / 10);
    return Math.floor(numberMap[9]) === (10 - (chk % 10)) % 10;
  }

  return false;
}

export function formatPhoneNumberWithHyphen(phone: string): string {
  // 모든 공백, 특수문자 제거
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, "");

  // 국제번호(+82)를 0으로 변환
  const normalized = cleaned.replace(/^82/, "0");

  // 숫자만 추출
  const numbers = normalized.replace(/\D/g, "");

  // 11자리 숫자인 경우에만 포맷팅
  if (numbers.length === 11) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  }

  return numbers;
}
