export const isEndDateOver = (date: Date) => {
  const isEnd = date.getTime() < new Date().getTime();

  return isEnd;
};

export const calculateEndDate = (
  currentEndDate: Date | null,
  accessDuration: number
): Date => {
  const now = new Date();
  const extensionMs = accessDuration * 24 * 60 * 60 * 1000;

  // 현재 활성화된 수강권이 있는 경우
  if (currentEndDate && currentEndDate > now) {
    // 현재 종료일에서 추가 기간을 연장
    return new Date(currentEndDate.getTime() + extensionMs);
  }

  // 새로운 구매인 경우
  return new Date(Date.now() + extensionMs);
};

export const getRemainingDays = (expiredAt: Date) => {
  const diff =
    (expiredAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);

  if (diff > 0) return Math.ceil(diff);
  return 0;
};
