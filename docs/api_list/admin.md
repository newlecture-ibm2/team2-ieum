# ⚙️ 관리자 API (Admin)

> 관리자 전용 API — 축제관리, 공지관리, 신고처리, 통계, 회원관리

**Base URL**: `/api/admin`  
**권한**: ADMIN 전용 (모든 API에 관리자 인증 필요)

### Request Headers (공통)

```
Authorization: Bearer {adminAccessToken}
```

---

## 📌 1. 관리자 인증 (Admin Auth)

### 1-1. 관리자 로그인

| 항목 | 내용 |
|------|------|
| **URL** | `POST /api/admin/auth/login` |
| **인증** | 불필요 |
| **권한** | ANYONE |

#### Request Body

```json
{
  "email": "admin@ieum.com",
  "password": "adminPassword!"
}
```

#### Response (200 OK)

```json
{
  "code": 200,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": {
      "id": 1,
      "email": "admin@ieum.com",
      "role": "ADMIN"
    }
  }
}
```

---

## 📌 2. 축제 관리 (Festival Management)

> 시스템 내부 등록 축제(Custom)와 공공 데이터 기반 축제(Public)를 나누어 관리합니다.

### 2-1. 자체 축제 (Custom) 등록

| 항목 | 내용 |
|------|------|
| **URL** | `POST /api/admin/managedFestivals` |
| **권한** | ADMIN |

#### Request Body

```json
{
  "title": "2026 벚꽃 축제",
  "description": "봄을 맞아 여의도에서 열리는 벚꽃 축제",
  "location": "서울특별시 여의도 한강공원",
  "address": "서울특별시 영등포구 여의도동 123",
  "startDate": "2026-04-01",
  "endDate": "2026-04-10",
  "imageUrl": "https://example.com/festival.jpg",
  "homepage": "https://festival.example.com",
  "tel": "02-1234-5678",
  "latitude": 37.5219,
  "longitude": 126.9245
}
```

#### Response (201 Created)

```json
{
  "code": 201,
  "message": "축제가 등록되었습니다.",
  "data": {
    "id": 57
  }
}
```

### 2-2. 자체 축제 (Custom) 수정

| 항목 | 내용 |
|------|------|
| **URL** | `PUT /api/admin/managedFestivals/{festivalId}` |
| **권한** | ADMIN |

> Request Body는 2-1 축제 등록과 동일

#### Response (200 OK)

```json
{
  "code": 200,
  "message": "축제 정보가 수정되었습니다."
}
```

### 2-3. 자체 축제 (Custom) 삭제

| 항목 | 내용 |
|------|------|
| **URL** | `DELETE /api/admin/managedFestivals/{festivalId}` |
| **권한** | ADMIN |

#### Response (204 No Content)

> 응답 본문 없음

### 2-4. 관리자용 자체 축제 (Custom) 목록 조회

| 항목 | 내용 |
|------|------|
| **URL** | `GET /api/admin/managedFestivals` |
| **권한** | ADMIN |

#### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `page` | Integer | ❌ | 페이지 번호 |
| `size` | Integer | ❌ | 페이지 크기 |
| `keyword` | String | ❌ | 검색 키워드 |

#### Response (200 OK)

```json
{
  "code": 200,
  "data": {
    "content": [
      {
        "id": 1,
        "title": "2026 자체 기획 벚꽃 축제",
        "status": "UPCOMING",
        "startDate": "2026-04-01",
        "endDate": "2026-04-10"
      }
    ],
    "totalElements": 12,
    "totalPages": 2
  }
}
```

### 2-5. 관리자용 공공 축제 목록 조회

| 항목 | 내용 |
|------|------|
| **URL** | `GET /api/admin/festivals` |
| **권한** | ADMIN |

#### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `page` | Integer | ❌ | 페이지 번호 |
| `size` | Integer | ❌ | 페이지 크기 |
| `status` | String | ❌ | 진행 상태 필터 |
| `keyword` | String | ❌ | 검색 키워드 |

#### Response (200 OK)

```json
{
  "code": 200,
  "data": {
    "content": [
      {
        "id": 100,
        "title": "공공 API 제공 진해 군항제",
        "status": "UPCOMING",
        "startDate": "2026-04-01",
        "endDate": "2026-04-10",
        "isVisible": true
      }
    ],
    "totalElements": 500,
    "totalPages": 50
  }
}
```

### 2-6. 공공 데이터 수동 동기화

| 항목 | 내용 |
|------|------|
| **URL** | `POST /api/admin/festivals/sync` |
| **권한** | ADMIN |

#### Response (200 OK)

```json
{
  "code": 200,
  "message": "데이터 동기화가 성공적으로 완료되었습니다."
}
```

### 2-7. 공공 축제 노출/숨김 수정

| 항목 | 내용 |
|------|------|
| **URL** | `PATCH /api/admin/festivals/{festivalId}/visibility` |
| **권한** | ADMIN |

#### Request Body

```json
{
  "isVisible": false
}
```

#### Response (200 OK)

```json
{
  "code": 200,
  "message": "노출 상태가 변경되었습니다."
}
```

---

## 📌 3. 공지사항 관리 (Notice Management)

### 3-1. 공지사항 등록

| 항목 | 내용 |
|------|------|
| **URL** | `POST /api/admin/notices` |
| **권한** | ADMIN |

#### Request Body

```json
{
  "title": "[공지] 서비스 업데이트 안내",
  "content": "이음 서비스가 업데이트되었습니다.",
  "isPinned": false
}
```

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `title` | String | ✅ | 공지 제목 |
| `content` | String | ✅ | 공지 내용 |
| `isPinned` | Boolean | ❌ | 상단 고정 여부 (기본: false) |

#### Response (201 Created)

```json
{
  "code": 201,
  "message": "공지사항이 등록되었습니다."
}
```

### 3-2. 공지사항 수정

| 항목 | 내용 |
|------|------|
| **URL** | `PUT /api/admin/notices/{noticeId}` |
| **권한** | ADMIN |

### 3-3. 공지사항 삭제

| 항목 | 내용 |
|------|------|
| **URL** | `DELETE /api/admin/notices/{noticeId}` |
| **권한** | ADMIN |

#### Response (204 No Content)

---

## 📌 4. 신고 처리 (Report Management)

### 4-1. 신고 목록 조회

| 항목 | 내용 |
|------|------|
| **URL** | `GET /api/admin/reports` |
| **권한** | ADMIN |

#### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `status` | String | ❌ | 상태 (`PENDING`, `RESOLVED`, `REJECTED`) |
| `targetType` | String | ❌ | 대상 타입 (`REVIEW`, `POST`, `COMMENT`) |
| `page` | Integer | ❌ | 페이지 번호 |
| `size` | Integer | ❌ | 페이지 크기 |

#### Response (200 OK)

```json
{
  "code": 200,
  "data": {
    "content": [
      {
        "id": 1,
        "targetType": "REVIEW",
        "targetId": 15,
        "reason": "SPAM",
        "description": "광고성 리뷰",
        "status": "PENDING",
        "reporter": {
          "id": 3,
          "nickname": "신고자"
        },
        "createdAt": "2026-03-25T14:00:00"
      }
    ]
  }
}
```

### 4-2. 신고 처리

| 항목 | 내용 |
|------|------|
| **URL** | `PUT /api/admin/reports/{reportId}` |
| **권한** | ADMIN |

#### Request Body

```json
{
  "status": "RESOLVED",
  "action": "DELETE_CONTENT",
  "adminNote": "스팸성 콘텐츠 확인, 삭제 처리"
}
```

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `status` | String | ✅ | `RESOLVED` / `REJECTED` |
| `action` | String | ❌ | `DELETE_CONTENT` / `WARN_USER` / `NONE` |
| `adminNote` | String | ❌ | 관리자 메모 |

#### Response (200 OK)

```json
{
  "code": 200,
  "message": "신고가 처리되었습니다."
}
```

---

## 📌 5. 통계 (Statistics)

### 5-1. 대시보드 통계

| 항목 | 내용 |
|------|------|
| **URL** | `GET /api/admin/statistics/dashboard` |
| **권한** | ADMIN |

#### Response (200 OK)

```json
{
  "code": 200,
  "data": {
    "totalFestivals": 57,
    "ongoingFestivals": 12,
    "totalUsers": 1500,
    "totalReviews": 3200,
    "totalPosts": 850,
    "pendingReports": 5,
    "todayNewUsers": 15,
    "todayNewReviews": 42
  }
}
```

### 5-2. 축제 인기 순위

| 항목 | 내용 |
|------|------|
| **URL** | `GET /api/admin/statistics/popular-festivals` |
| **권한** | ADMIN |

#### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `limit` | Integer | ❌ | 조회 개수 (기본: 10) |
| `period` | String | ❌ | 기간 (`WEEK`, `MONTH`, `ALL`) |

#### Response (200 OK)

```json
{
  "code": 200,
  "data": [
    {
      "festivalId": 1,
      "title": "2026 벚꽃 축제",
      "reviewCount": 120,
      "avgRating": 4.5,
      "favoriteCount": 340
    }
  ]
}
```

---

## 📌 6. 회원 관리 (Member Management)

> 관리자가 회원 목록을 조회하고, 상태 변경(7일 정지/해제), 역할 변경(USER↔ADMIN), 강제 탈퇴를 수행합니다.

### 6-1. 회원 목록 조회

| 항목 | 내용 |
|------|------|
| **URL** | `GET /api/admin/members` |
| **권한** | ADMIN |

#### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `page` | Integer | ❌ | 페이지 번호 (기본: 1) |
| `size` | Integer | ❌ | 페이지 크기 (기본: 10) |
| `status` | String | ❌ | 상태 필터 (`ACTIVE` / `SUSPENDED` / `DELETED`) |
| `role` | String | ❌ | 역할 필터 (`USER` / `ADMIN`) |
| `searchType` | String | ❌ | 검색 기준 (`ALL` / `NAME` / `NICKNAME` / `LOGIN_ID`) |
| `keyword` | String | ❌ | 검색어 |

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "userId": 1,
        "loginId": "user@example.com",
        "name": "홍길동",
        "nickname": "축제매니아",
        "phone": "010-1234-5678",
        "profileImage": "/uploads/profiles/1.jpg",
        "role": "USER",
        "status": "ACTIVE",
        "suspendedUntil": null,
        "createdAt": "2026-03-25T10:00:00",
        "updatedAt": null,
        "deletedAt": null,
        "reportedCount": 2
      }
    ],
    "totalPages": 5,
    "totalElements": 45,
    "activeCount": 40,
    "suspendedCount": 3,
    "deletedCount": 2
  }
}
```

### 6-2. 회원 상세 조회

| 항목 | 내용 |
|------|------|
| **URL** | `GET /api/admin/members/{userId}` |
| **권한** | ADMIN |

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "userId": 1,
    "loginId": "user@example.com",
    "name": "홍길동",
    "nickname": "축제매니아",
    "phone": "010-1234-5678",
    "profileImage": "/uploads/profiles/1.jpg",
    "role": "USER",
    "status": "ACTIVE",
    "suspendedUntil": null,
    "createdAt": "2026-03-25T10:00:00",
    "updatedAt": null,
    "deletedAt": null,
    "reportedCount": 5
  }
}
```

**에러:** 404 — 존재하지 않는 회원 ID

### 6-3. 회원 상태 변경 (7일 정지 / 해제)

| 항목 | 내용 |
|------|------|
| **URL** | `PATCH /api/admin/members/{userId}/status` |
| **권한** | ADMIN |

> 신고 횟수가 4건 이상인 회원에 대해 7일 정지를 적용합니다. 정지 시 `suspended_until`에 7일 후 일시가 자동 설정됩니다.

#### Request Body

```json
{
  "status": "SUSPENDED"
}
```

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `status` | String | ✅ | `SUSPENDED` (7일 정지) 또는 `ACTIVE` (정지 해제) |

#### Response (200 OK)

```json
{
  "success": true,
  "data": "회원이 7일간 정지되었습니다."
}
```

**에러:** 400 — 유효하지 않은 상태값

### 6-4. 회원 강제 탈퇴

| 항목 | 내용 |
|------|------|
| **URL** | `DELETE /api/admin/members/{userId}` |
| **권한** | ADMIN |

> 관리자가 회원을 강제 탈퇴시킵니다. 소프트 삭제(status='DELETED', deleted_at 기록)로 처리됩니다.

#### Response (200 OK)

```json
{
  "success": true,
  "data": "회원이 탈퇴 처리되었습니다."
}
```

**에러:** 404 — 존재하지 않는 회원 ID

### 6-5. 회원 역할 변경 (USER ↔ ADMIN)

| 항목 | 내용 |
|------|------|
| **URL** | `PATCH /api/admin/members/{userId}/role` |
| **권한** | ADMIN |

#### Request Body

```json
{
  "role": "ADMIN"
}
```

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `role` | String | ✅ | `USER` 또는 `ADMIN` |

#### Response (200 OK)

```json
{
  "success": true,
  "data": "관리자 권한이 부여되었습니다."
}
```

**에러:** 400 — 유효하지 않은 역할값

