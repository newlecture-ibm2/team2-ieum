// iron-session 설정
//
// TODO: iron-session 패키지 설치 후 구현
// npm install iron-session
//
// 세션에 저장할 데이터:
// - accessToken: string (JWT)
// - user: { id, email, nickname, role }

export const sessionOptions = {
  cookieName: "ieum_session",
  password: process.env.SESSION_SECRET || "complex_password_at_least_32_characters_long",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24, // 24시간
  },
};

export interface SessionData {
  accessToken?: string;
  user?: {
    id: number;
    email: string;
    nickname: string;
    role: "USER" | "ADMIN";
  };
}
