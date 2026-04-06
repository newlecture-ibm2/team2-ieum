import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// GET /api/auth/me — 현재 세션의 로그인 유저 정보 반환
export async function GET() {
  const session = await getSession();

  if (!session.user) {
    return NextResponse.json({ isLoggedIn: false, user: null });
  }

  return NextResponse.json({ isLoggedIn: true, user: session.user });
}
