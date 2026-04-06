import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST() {
  const session = await getSession();
  session.destroy();  // ← 세션 쿠키 삭제
  return NextResponse.json({ message: "로그아웃 완료" }, { status: 200 });
}
