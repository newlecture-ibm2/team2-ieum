import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * 비밀번호 찾기 프로세스 프록시 라우트
 * - request: 인증 코드 요청
 * - verify: 코드 검증
 * - reset: 비밀번호 재설정
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ...data } = body;

    let endpoint = "";
    if (action === "request") endpoint = "/api/auth/password-recovery/request";
    else if (action === "verify") endpoint = "/api/auth/password-recovery/verify";
    else if (action === "reset") endpoint = "/api/auth/password-recovery/reset";
    else return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });

    const backendRes = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || "처리에 실패했습니다." },
        { status: backendRes.status }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
