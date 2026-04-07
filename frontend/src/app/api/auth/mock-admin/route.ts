import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

/**
 * 개발용 Mock ADMIN 로그인 엔드포인트
 * 브라우저 주소창에 /api/auth/mock-admin 입력 시 자동으로 관리자 세션 발급 후 /admin 으로 이동
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  
  session.accessToken = "mock-admin-token";
  session.user = {
    id: 999,
    email: "admin@ieum.com",
    nickname: "최고관리자",
    role: "ADMIN",
  };
  
  await session.save();

  return NextResponse.redirect(new URL("/admin", req.url));
}
