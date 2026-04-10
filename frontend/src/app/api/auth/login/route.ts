import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { id, password } = await req.json();

  // 🚀 [v18] 환경 변수 방어: NEXT_PUBLIC_API_URL이 없으면 로컬 백엔드로 시도
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  // 1) 백엔드에 로그인 요청
  const backendRes = await fetch(`${apiBaseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, password }),
  });

  const data = await backendRes.json();

  // 🛡️ 백엔드 응답이 에러거나 success가 false인 경우 처리
  if (!backendRes.ok || !data.success) {
    return NextResponse.json(
      { message: data.message || "아이디 또는 비밀번호가 일치하지 않습니다." }, 
      { status: backendRes.status === 200 ? 401 : backendRes.status }
    );
  }

  // 2) 성공 시 ApiResponse에서 알맹이(data) 추출
  const loginInfo = data.data; // AuthRes.TokenDto

  if (!loginInfo || !loginInfo.accessToken) {
    return NextResponse.json({ message: "유효하지 않은 응답 규격입니다." }, { status: 500 });
  }

  // 3) iron-session에 유저 정보 저장
  const session = await getSession();
  session.accessToken = loginInfo.accessToken;
  session.user = {
    userId: loginInfo.user.userId,
    id: loginInfo.user.id,
    nickname: loginInfo.user.nickname,
    role: loginInfo.user.role,
    status: loginInfo.user.status || "ACTIVE",
  };
  await session.save();  // ← 쿠키에 암호화해서 저장

  return NextResponse.json({ message: "로그인 성공", user: session.user }, { status: 200 });
}
