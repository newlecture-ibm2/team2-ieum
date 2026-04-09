# 이음(ieum) 백엔드 청사진 (Blueprint) - Phase 2: 인증/인가 (Auth)

> 🎯 **목표:** JWT 기반의 사용자 인증 체계 구축, 헥사고날 아키텍처를 준수하는 로그인 및 회원가입 REST API 구현
> 🏢 **도메인:** 인증 (Auth), 사용자 (User), 보안 (Security)

---

## 1. 기술 스택 및 보안 정책
* **인증 방식**: JWT (Access Token & Refresh Token 기반)
* **라이브러리**: `io.jsonwebtoken:jjwt`, `spring-boot-starter-security`
* **비밀번호 저장**: Spring Security의 `BCryptPasswordEncoder` 단방향 해싱

---

## 2. API 엔드포인트 세부 명세서 (auth.md 공식 사양서 기준)

공통 응답 래퍼 `ApiResponse`(`{code, message, data}`)를 사용하여 통일성을 제공합니다.

### 2.1 로그인 (`POST /api/auth/login`)
* **Request**: `email`, `password`
* **Response `data`**:
  ```json
  {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": 3600,
    "user": { "id": 1, "email": "...", "nickname": "...", "role": "USER" }
  }
  ```

### 2.2 회원가입 (`POST /api/auth/register`)
* **Request**: `email`, `password`, `nickname`, `phone`(optional)
* **Response `data`**: 생성된 `user` 정보

### 2.3 토큰 재발급 (`POST /api/auth/refresh`)
* **Request**: `refreshToken`
* **Response `data`**: 신규 `accessToken`, `refreshToken`, `expiresIn`

### 2.4 이메일 중복 확인 (`GET /api/auth/check-email?email=xxx`)
* **Response `data`**: `{ "available": true }`

---

## 3. 진행 (Task) 순서

1. **도메인 및 포트 작성**: `User`, `Role` 객체 및 포트 인터페이스 선언
2. **영속성 어댑터 세팅**: `UserJpaEntity`, `RefreshTokenEntity` 테이블 매핑 (PostgreSQL 연동)
3. **보안/JWT 모듈 구현**: `JwtProvider` (Access/Refresh Token 발급) 및 필터 작성
4. **비즈니스 로직 구현**: `AuthService` 개발 (로그인, 회원가입, 토큰 리프레시 로직)
5. **어댑터(Web) 연결**: `AuthController` 구현 및 공통 `ApiResponse` 포맷팅
6. **테스트 검증**: Postman 및 서버 통신 검증
