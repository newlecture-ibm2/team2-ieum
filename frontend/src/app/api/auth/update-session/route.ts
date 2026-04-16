import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

/**
 * POST /api/auth/update-session
 * 
 * 닉네임 변경 등으로 새로 발급된 JWT 토큰을 iron-session 쿠키에 즉시 반영합니다.
 * 이를 통해 FCM 알림 등 토큰 기반 기능에서 최신 닉네임이 사용됩니다.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();

  if (!session.user || !session.accessToken) {
    return NextResponse.json(
      { success: false, message: "인증되지 않은 요청입니다." },
      { status: 401 }
    );
  }

  try {
    const { newToken, nickname } = await req.json();

    if (!newToken) {
      return NextResponse.json(
        { success: false, message: "새 토큰이 제공되지 않았습니다." },
        { status: 400 }
      );
    }

    // iron-session 쿠키의 토큰과 닉네임을 최신 값으로 교체합니다.
    session.accessToken = newToken;
    if (nickname) {
      session.user.nickname = nickname;
    }
    await session.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("세션 업데이트 실패:", error);
    return NextResponse.json(
      { success: false, message: "세션 업데이트에 실패했습니다." },
      { status: 500 }
    );
  }
}
