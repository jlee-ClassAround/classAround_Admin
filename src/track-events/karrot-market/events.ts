/**
 * 당근마켓 픽셀 이벤트 추적 유틸리티
 */

export const trackDanggeunEvent = (eventName: "Lead" | "ViewPage" | string) => {
  if (typeof window !== "undefined" && window.karrotPixel) {
    window.karrotPixel.track(eventName);
  }
};
