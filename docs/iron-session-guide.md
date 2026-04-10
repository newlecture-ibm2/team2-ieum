# 🔐 iron-session 인증 가이드 (로그인 담당자용)

## 이미 세팅된 것 (혜연 작업분)

### 1. `src/lib/session.ts` — 세션 설정 & 유틸
```ts
import { getSession } from "@/lib/session";

// 서버 컴포넌트 또는 API Route에서 세션 읽기
const session = await getSession();
session.user       // { id, email, nickname, role } 또는 undefined
session.accessToken // JWT 토큰 또는 undefined
```

### 2. `/api/auth/me` — 현재 로그인 상태 확인 API
```
GET /api/auth/me
→ { isLoggedIn: true, user: { id, email, nickname, role } }
→ { isLoggedIn: false, user: null }
```
Header 컴포넌트가 이 API를 호출해서 로그인/비로그인 UI를 전환함.

---

## 구현해야 할 것

### 1. 로그인 API Route — `src/app/api/auth/login/route.ts`
```ts
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

  return NextResponse.json({ message: "로그인 성공", user: session.user });
}
```

### 2. 로그아웃 API Route — `src/app/api/auth/logout/route.ts`
```ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST() {
  const session = await getSession();
  session.destroy();  // ← 세션 쿠키 삭제
  return NextResponse.json({ message: "로그아웃 완료" });
}
```

### 3. 로그인 페이지에서 호출하는 방법
```ts
// 로그인 버튼 클릭 시
const res = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

if (res.ok) {
  window.location.href = "/";  // 홈으로 이동 → Header가 자동으로 로그인 상태 감지
}
```

```ts
// 로그아웃 버튼 클릭 시
await fetch("/api/auth/logout", { method: "POST" });
window.location.href = "/";
```

---

## 흐름 요약

```
[로그인 페이지]
  → POST /api/auth/login (Next.js API Route)
    → 백엔드 /api/auth/login 호출
    → 성공 시 iron-session 쿠키에 유저 정보 저장
    → 홈으로 리다이렉트

[Header 컴포넌트]
  → GET /api/auth/me (Next.js API Route)
    → iron-session 쿠키에서 유저 정보 읽기
    → isLoggedIn: true → 알림벨 + 마이페이지 아이콘 표시
    → isLoggedIn: false → 로그인 버튼 표시
```

## ⚠️ 주의사항
- `.env.local`에 `SESSION_SECRET` 추가 필요 (32자 이상 랜덤 문자열)
  ```
  SESSION_SECRET=여기에_32자_이상의_비밀키_입력
  ```
- `session.save()`를 반드시 호출해야 쿠키에 저장됨
- `session.destroy()`로 로그아웃 처리
