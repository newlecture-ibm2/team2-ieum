# 👤 API 목록 — 마이페이지 영역 (My Page)

사용자의 개인 활동 정보 조회 및 회원 정보 관리를 위한 API 목록입니다.

---

## 1. 마이페이지 API 목록

| API ID | Method | Endpoint | 설명 | 사용 화면 |
|--------|--------|----------|------|----------|
| API_MYP_0010 | GET | `/api/mypage/profile` | 내 프로필 정보 조회 | 마이페이지 홈 |
| API_MYP_0020 | PATCH | `/api/mypage/profile` | 내 프로필 정보 수정 | 회원정보 수정 |
| API_MYP_0030 | GET | `/api/mypage/festivals/scrap` | 내가 찜한 축제 목록 | 마이페이지 > 찜한 축제 |
| API_MYP_0040 | GET | `/api/mypage/reviews` | 내가 쓴 리뷰 목록 | 마이페이지 > 내 리뷰 |
| API_MYP_0050 | GET | `/api/mypage/posts` | 내가 쓴 게시글 목록 | 마이페이지 > 내 게시물 |
| API_MYP_0060 | PATCH | `/api/mypage/password` | 비밀번호 변경 | 회원정보 수정 |
| API_MYP_0070 | DELETE | `/api/mypage/withdraw` | 회원 탈퇴 | 회원탈퇴 화면 |

---

## 2. 주요 명세 특징

### 2-1. 내 활동 정보 조회 (`GET /api/mypage/profile`)
-   닉네임, 프로필 이미지, 찜한 개수, 작성 리뷰 수 등의 통계 정보 포함.
-   응답 예시: `200 OK { "code": 200, "message": "성공", "data": { ... } }`

### 2-2. 보안 정책
-   모든 마이페이지 API는 **로그인한 본인**만 접근 가능합니다. (JWT 인증필수)
-   비밀번호 변경 시에는 현재 비밀번호 확인 과정을 반드시 거칩니다.

---

> **작성일**: 2026-03-28  
> **버전**: v1.0
