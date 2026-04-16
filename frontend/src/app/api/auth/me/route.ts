import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// GET /api/auth/me — 현재 세션의 로그인 유저 정보 반환
export async function GET() {
  const session = await getSession();

  if (!session.user || !session.accessToken) {
    return NextResponse.json({ isLoggedIn: false, user: null });
  }

  // 백엔드 통신하여 최신 상태 동기화 (예: 관리자가 강제 정지/해제 시 실시간 반영)
  try {
    const apiBaseUrl = process.env.BACKEND_URL || process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const res = await fetch(`${apiBaseUrl}/api/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${session.accessToken}`,
        "Content-Type": "application/json"
      },
      // cache: "no-store", // 실시간 반영 위해 캐시 무효화 -> Next.js route에서는 fetch 캐시가 기본적으로 방지되기도 하나 명시
    });

    if (res.ok) {
      const data = await res.json();
      const backendUser = data?.data?.user;
      if (backendUser && backendUser.status && backendUser.status !== session.user.status) {
        // 상태가 변경된 경우 세션 업데이트 (정지 -> 정상, 정상 -> 정지 등)
        session.user.status = backendUser.status;
        if (backendUser.role) session.user.role = backendUser.role;
        if (backendUser.nickname) session.user.nickname = backendUser.nickname;
        await session.save();
      }
    }
  } catch (error) {
    console.error("세션 최신화 중 오류:", error);
  }

  return NextResponse.json({ isLoggedIn: true, user: session.user });
}
