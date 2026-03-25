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

// 회원 전용 경로
const PROTECTED_ROUTES = ["/mypage", "/community/write"];

// 관리자 전용 경로
const ADMIN_ROUTES = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // TODO: iron-session에서 세션 읽기
  // const session = await getSession(request);

  // 관리자 전용 경로 체크
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    // TODO: ADMIN role 검증
    // if (!session?.user || session.user.role !== 'ADMIN') {
    //   return NextResponse.redirect(new URL('/auth/login', request.url));
    // }
  }

  // 회원 전용 경로 체크
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    // TODO: USER/ADMIN role 검증
    // if (!session?.user) {
    //   return NextResponse.redirect(new URL('/auth/login', request.url));
    // }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/mypage/:path*", "/community/write/:path*"],
};
