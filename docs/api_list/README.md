# 📋 이음(ieum) API 명세서

> Spring Boot Backend REST API 명세 문서

---

## 📁 파일 구조

| 파일명 | 설명 | 권한 |
|--------|------|------|
| [common.md](./common.md) | 🛠️ 공통 (파일 업로드, 공통코드, 에러응답) | 누구나 |
| [auth.md](./auth.md) | 회원가입 / 로그인 / 토큰 관리 | 누구나 |
| [mypage.md](./mypage.md) | 👤 마이페이지 (프로필, 내 활동, 탈퇴) | USER |
| [festival.md](./festival.md) | 축제 조회 / 검색 / 상세 | 누구나 |
| [review.md](./review.md) | 축제 리뷰 / 별점 | USER |
| [favorite.md](./favorite.md) | 즐겨찾기 (관심 축제) | USER |
| [community.md](./community.md) | 커뮤니티 게시판 (Q&A / 꿀팁 / 먹거리) | 누구나(조회) / USER(작성) |
| [notice.md](./notice.md) | 공지사항 조회 | 누구나 |
| [report.md](./report.md) | 신고 접수 | USER |
| [admin.md](./admin.md) | 관리자 전용 API (축제관리, 공지관리, 신고처리, 통계, 설문, 회원관리) | ADMIN |
| [tour_api_public_data.md](./tour_api_public_data.md) | 🏛️ 공공데이터 — 한국관광공사 국문 관광정보 서비스 (TourAPI) | 서버 내부 |

---

## 🔑 인증 방식

| 방식 | 설명 |
|------|------|
| **JWT (Bearer Token)** | `Authorization: Bearer <accessToken>` |
| **iron-session (BFF)** | Next.js API Routes 에서 세션 관리 |

---

## 📐 공통 응답 형식

### 성공 응답

```json
{
  "code": 200,
  "message": "성공",
  "data": { ... }
}
```

### 에러 응답

```json
{
  "code": 400,
  "message": "잘못된 요청입니다.",
  "errors": [
    {
      "field": "email",
      "message": "이메일 형식이 올바르지 않습니다."
    }
  ]
}
```

### HTTP 상태 코드

| 코드 | 의미 | 설명 |
|------|------|------|
| `200` | OK | 요청 성공 |
| `201` | Created | 리소스 생성 성공 |
| `204` | No Content | 삭제 성공 (응답 본문 없음) |
| `400` | Bad Request | 잘못된 요청 (유효성 검증 실패) |
| `401` | Unauthorized | 인증 실패 (토큰 없음/만료) |
| `403` | Forbidden | 권한 부족 |
| `404` | Not Found | 리소스를 찾을 수 없음 |
| `409` | Conflict | 중복 데이터 (이메일 중복 등) |
| `500` | Internal Server Error | 서버 오류 |

---

## 🌐 Base URL

| 환경 | URL |
|------|-----|
| 로컬 개발 | `http://localhost:8080` |
| BFF 경유 | `http://localhost:3000/api` |
| Docker | `http://backend:8080` |

---

## 📝 명세서 작성 가이드

각 API 항목은 아래 형식으로 작성합니다:

```markdown
### API 이름

| 항목 | 내용 |
|------|------|
| **URL** | `METHOD /api/path` |
| **인증** | 필요 / 불필요 |
| **권한** | ANYONE / USER / ADMIN |

#### Request

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `name` | String | ✅ | 이름 |

#### Response

​```json
{
  "code": 200,
  "data": { ... }
}
​```
```
