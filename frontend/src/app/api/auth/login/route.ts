import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  // 1) 백엔드에 로그인 요청
  const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!backendRes.ok) {
    return NextResponse.json({ message: "로그인 실패" }, { status: 401 });
  }

  const data = await backendRes.json();

  // 2) iron-session에 유저 정보 저장
  const session = await getSession();
  session.accessToken = data.data.accessToken;
  session.user = {
    id: data.data.user.id,
    email: data.data.user.email,
    nickname: data.data.user.nickname,
    role: data.data.user.role,
  };
  await session.save();  // ← 쿠키에 암호화해서 저장

  return NextResponse.json({ message: "로그인 성공", user: session.user }, { status: 200 });
}
