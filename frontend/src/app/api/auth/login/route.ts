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

  // 🛡️ [v18-Final] 비정상 응답 방어: JSON 파싱 에러 및 비즈니스 로직 에러 통합 처리
  let data;
  try {
    data = await backendRes.json();
  } catch (e) {
    return NextResponse.json({ message: "서버로부터 비정상적인 응답을 받았습니다." }, { status: 500 });
  }

  if (!backendRes.ok || !data.success) {
    return NextResponse.json(
      { message: data.message || "아이디 또는 비밀번호가 일치하지 않습니다." }, 
      { status: backendRes.status === 200 ? 401 : backendRes.status }
    );
  }

  // 2) 성공 시 ApiResponse에서 알맹이(data) 추출
  const loginInfo = data.data; // AuthRes.TokenDto

  if (!loginInfo || !loginInfo.accessToken || !loginInfo.user) {
    return NextResponse.json({ message: "유효하지 않은 응답 규격이거나 유저 정보가 없습니다." }, { status: 500 });
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
