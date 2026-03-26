# 🔐 인증 API (Auth)

> 회원가입, 로그인, 토큰 재발급 관련 API

**Base URL**: `/api/auth`  
**권한**: 누구나 접근 가능

---

## 1. 회원가입

| 항목 | 내용 |
|------|------|
| **URL** | `POST /api/auth/register` |
| **인증** | 불필요 |
| **권한** | ANYONE |

### Request Body

```json
{
  "email": "user@example.com",
  "password": "password123!",
  "nickname": "축제매니아",
  "phone": "010-1234-5678"
}
```

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `email` | String | ✅ | 이메일 (로그인 ID) |
| `password` | String | ✅ | 비밀번호 (8자 이상, 영문+숫자+특수문자) |
| `nickname` | String | ✅ | 닉네임 (2~20자) |
| `phone` | String | ❌ | 전화번호 |

### Response

#### 성공 (201 Created)

```json
{
  "code": 201,
  "message": "회원가입이 완료되었습니다.",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "축제매니아"
  }
}
```

#### 실패 (409 Conflict)

```json
{
  "code": 409,
  "message": "이미 사용 중인 이메일입니다."
}
```

---

## 2. 로그인

| 항목 | 내용 |
|------|------|
| **URL** | `POST /api/auth/login` |
| **인증** | 불필요 |
| **권한** | ANYONE |

### Request Body

```json
{
  "email": "user@example.com",
  "password": "password123!"
}
```

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `email` | String | ✅ | 이메일 |
| `password` | String | ✅ | 비밀번호 |

### Response

#### 성공 (200 OK)

```json
{
  "code": 200,
  "message": "로그인 성공",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "expiresIn": 3600,
    "user": {
      "id": 1,
      "email": "user@example.com",
      "nickname": "축제매니아",
      "role": "USER"
    }
  }
}
```

#### 실패 (401 Unauthorized)

```json
{
  "code": 401,
  "message": "이메일 또는 비밀번호가 올바르지 않습니다."
}
```

---

## 3. 토큰 재발급

| 항목 | 내용 |
|------|------|
| **URL** | `POST /api/auth/refresh` |
| **인증** | 불필요 (refreshToken 사용) |
| **권한** | ANYONE |

### Request Body

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

### Response

#### 성공 (200 OK)

```json
{
  "code": 200,
  "message": "토큰 재발급 성공",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "expiresIn": 3600
  }
}
```

---

## 4. 로그아웃

| 항목 | 내용 |
|------|------|
| **URL** | `POST /api/auth/logout` |
| **인증** | 필요 |
| **권한** | USER |

### Request Headers

```
Authorization: Bearer {accessToken}
```

### Response

#### 성공 (200 OK)

```json
{
  "code": 200,
  "message": "로그아웃되었습니다."
}
```

---

## 5. 이메일 중복 확인

| 항목 | 내용 |
|------|------|
| **URL** | `GET /api/auth/check-email` |
| **인증** | 불필요 |
| **권한** | ANYONE |

### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `email` | String | ✅ | 확인할 이메일 |

### Response

```json
{
  "code": 200,
  "data": {
    "available": true
  }
}
```

---

## 6. 내 정보 조회

| 항목 | 내용 |
|------|------|
| **URL** | `GET /api/auth/me` |
| **인증** | 필요 |
| **권한** | USER |

### Request Headers

```
Authorization: Bearer {accessToken}
```

### Response

```json
{
  "code": 200,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "축제매니아",
    "phone": "010-1234-5678",
    "role": "USER",
    "createdAt": "2026-03-25T10:00:00"
  }
}
```
