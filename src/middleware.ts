// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from './lib/session';

const matchRoute = (pathname: string, patterns: Set<string>) => {
    return Array.from(patterns).some((pattern) => {
        if (pattern.startsWith('^')) {
            return new RegExp(pattern).test(pathname);
        }
        return pathname === pattern;
    });
};

// ✅ 로그인 필수인 관리자 라우트들
const authRoutes = new Set<string>([
    '^/$',
    '^/ivy(?:/.*)?$', // /ivy 이하 전체 보호
    '^/cojooboo(?:/.*)?$', // 필요 없으면 지워도 됨
]);

// ✅ 비로그인 유저만 들어올 수 있는 라우트들
const guestRoutes = new Set<string>([
    '^/login(?:/.*)?$',
    '^/first-register(?:/.*)?$', // 최초등록 페이지
]);

export default function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const search = req.nextUrl.search;

    // 🔥 iron-session이 만든 쿠키 이름이 "Session" 이라고 했으니 그대로 사용
    const sessionCookie = req.cookies.get('Session');
    const isLoggedIn = !!sessionCookie?.value;

    const isAuthRoute = matchRoute(pathname, authRoutes);
    const isGuestRoute = matchRoute(pathname, guestRoutes);

    // 로그인 안 했는데 보호 라우트 접근 → /login 으로
    if (!isLoggedIn && isAuthRoute) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('redirect', `${pathname}${search}`);
        return NextResponse.redirect(loginUrl);
    }

    // 로그인 했는데 /login, /first-register 접근 → 메인으로
    if (isLoggedIn && isGuestRoute) {
        return NextResponse.redirect(new URL('/ivy', req.url)); // 메인 경로에 맞게 수정
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.html$).*)',
    ],
};
