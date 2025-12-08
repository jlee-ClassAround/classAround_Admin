// 기본 응답 타입
export type ServerResponse<T = void> = T extends void
  ? { success: true } | { success: false; message: string }
  : { success: true; data: T } | { success: false; message: string };

// 에러 코드가 필요한 경우
export type ServerResponseWithCode<T = void> = T extends void
  ? { success: true } | { success: false; message: string; code: string }
  :
      | { success: true; data: T }
      | { success: false; message: string; code: string };
