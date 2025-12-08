import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./lib/session";

const matchRoute = (pathname: string, patterns: Set<string>) => {
  return Array.from(patterns).some((pattern) => {
    if (pattern.startsWith("^")) {
      return new RegExp(pattern).test(pathname);
    }
    return pathname === pattern;
  });
};

// 로그인 유저 전용
const authRoutes = new Set([
  "^/courses/[^/]+/lessons/[^/]+",
  "^/mypage(?:/.*)?$",
  "^/checkout(?:/.*)?$",
]);

// 로그아웃 유저 전용
const guestRoutes = new Set([
  "^/login(?:/.*)?$",
  "/kakao/start",
  "/kakao/complete",
  "/sign-up",
  "/find-email",
  "/find-pw",
]);

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const search = req.nextUrl.search;
  const session = await getSession();
  const isLoggedIn = Boolean(session.id);
  const isAuthRoute = matchRoute(pathname, authRoutes);
  const isGuestRoute = matchRoute(pathname, guestRoutes);

  if (!isLoggedIn && isAuthRoute) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isGuestRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.html$).*)",
  ],
};
