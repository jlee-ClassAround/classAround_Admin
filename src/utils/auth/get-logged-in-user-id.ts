import { getSession } from "@/lib/session";

/**
 * 로그인한 유저의 ID를 반환합니다.
 * @returns 로그인한 유저의 ID
 * 로그인하지 않은 경우 undefined를 반환합니다.
 */
export const getLoggedInUserId = async () => {
  const session = await getSession();
  return session.id;
};
