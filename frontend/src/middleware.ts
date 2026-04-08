// middleware.ts — 라우트 보호
//
// TODO: iron-session에서 role 확인 로직 구현
//
// /admin/* 경로 접근 시:
//   → iron-session에서 role 확인
//   → ADMIN이 아니면 /auth/login 으로 리다이렉트
//
// /mypage, /community/write 등 회원 전용 경로 접근 시:
//   → iron-session에서 role 확인
//   → USER/ADMIN이 아니면 /auth/login 으로 리다이렉트
//
// 비회원 허용 경로 (/, /festivals, /calendar, /notices 등):
//   → 통과

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions } from "./lib/session";
import type { SessionData } from "./lib/session";

// 회원 전용 경로
const PROTECTED_ROUTES = ["/mypage", "/community/write"];

// 관리자 전용 경로
const ADMIN_ROUTES = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  // 대상 경로가 아니라면 바로 패스하여 성능 최적화
  if (!isAdminRoute && !isProtectedRoute) {
    return NextResponse.next();
  }

  // Next.js 15+ 에서는 await cookies() 사용
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  // 관리자 전용 경로 체크: ADMIN이 아니면 / (랜딩페이지) 로 강제 이동
  if (isAdminRoute) {
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 회원 전용 경로 체크: 로그인이 안되어있으면 /auth/login 으로 이동
  if (isProtectedRoute) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/mypage/:path*", "/community/write/:path*"],
};
