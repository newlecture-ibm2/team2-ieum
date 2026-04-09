import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

/* ===== 세션 데이터 타입 ===== */
export interface SessionData {
  accessToken?: string;
  refreshToken?: string;
  user?: {
    userId: number;
    id: string; // loginId
    nickname: string;
    role: "USER" | "ADMIN";
    status?: string; // ACTIVE | SUSPENDED | WITHDRAWAL
  };
}

/* ===== iron-session 옵션 ===== */
export const sessionOptions: SessionOptions = {
  cookieName: "ieum_session",
  password: process.env.SESSION_SECRET || "complex_password_at_least_32_characters_long",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24, // 24시간
  },
};

/* ===== 서버 컴포넌트 / API Route 에서 세션 읽기 ===== */
export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
