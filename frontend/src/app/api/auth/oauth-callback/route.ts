import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

/**
 * 카카오 소셜 로그인 완료 후 백엔드(OAuth2SuccessHandler)에서 
 * JWT 토큰을 쿼리 파라미터로 실어서 리다이렉트 해 주는 엔드포인트입니다.
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (!accessToken || !refreshToken) {
      const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || req.nextUrl.origin;
      return NextResponse.redirect(new URL("/login?error=OAuth2_Token_Missing", baseUrl));
    }

    // 👤 백엔드에 사용자 정보 요청 (하드코딩 없이 환경 변수 활용)
    const apiBaseUrl = process.env.BACKEND_URL || process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const userResponse = await fetch(`${apiBaseUrl}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user profile from backend");
    }

    const userData = await userResponse.json();

    // ✅ lib/session의 getSession() 도우미를 사용하여 세션을 안전하게 저장합니다.
    const session = await getSession();

    session.accessToken = accessToken;
    session.refreshToken = refreshToken;
    session.user = userData; // { id, loginId, nickname, role, ... }

    await session.save();

    // 토큰 저장 후 메인 홈으로 리다이렉트
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || req.nextUrl.origin;
    return NextResponse.redirect(new URL("/", baseUrl));
  } catch (error) {
    console.error("OAuth Callback Error:", error);
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || req.nextUrl.origin;
    return NextResponse.redirect(new URL("/login?error=OAuth2_Callback_Failed", baseUrl));
  }
}
