# 🚨 신고 API (Report)

> 부적절한 콘텐츠 신고 관련 API

---

## 공통 코드 정의

### 신고 대상 타입

| 타입 코드 | 설명 |
|-----------|------|
| `REVIEW` | 리뷰 신고 |
| `POST` | 게시글 신고 |
| `COMMENT` | 댓글 신고 |

### 신고 사유

| 사유 코드 | 설명 |
|-----------|------|
| `SPAM` | 스팸/광고 |
| `ABUSE` | 욕설/비방 |
| `INAPPROPRIATE` | 부적절한 내용 |
| `FALSE_INFO` | 허위 정보 |
| `OTHER` | 기타 |

### 신고 상태

| 상태 | 설명 |
|------|------|
| `PENDING` | 대기중 (미처리) |
| `RESOLVED` | 처리완료 (대상 콘텐츠 삭제) |
| `REJECTED` | 반려 (신고 기각) |

### 처리 액션

| 액션 | 설명 |
|------|------|
| `DELETE` | 신고 대상 콘텐츠 삭제 |
| `DISMISS` | 신고 반려 (콘텐츠 유지) |

---

## 사용자 API

**Base URL**: `/api/reports`  
**권한**: USER (회원 전용)

### 1. 신고 접수

| 항목 | 내용 |
|------|------|
| **URL** | `POST /api/reports` |
| **인증** | 필요 |
| **권한** | USER |

#### Request Headers

```
Authorization: Bearer {accessToken}
```

#### Request Body

```json
{
  "targetType": "REVIEW",
  "targetId": 15,
  "reason": "SPAM",
  "description": "광고성 리뷰입니다."
}
```

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `targetType` | String | ✅ | 신고 대상 (`REVIEW`, `POST`, `COMMENT`) |
| `targetId` | Long | ✅ | 신고 대상 ID |
| `reason` | String | ✅ | 신고 사유 코드 |
| `description` | String | ❌ | 상세 사유 (최대 500자) |

#### Response (201 Created)

```json
{
  "code": 201,
  "message": "신고가 접수되었습니다.",
  "data": {
    "id": 1,
    "targetType": "REVIEW",
    "targetId": 15,
    "status": "PENDING"
  }
}
```

#### 실패 (409 Conflict)

```json
{
  "code": 409,
  "message": "이미 신고한 콘텐츠입니다."
}
```

---

## 관리자 API

**Base URL**: `/api/admin/reports`  
**권한**: ADMIN (관리자 전용)

### 2. 신고 목록 조회 (API_ADM_0050)

| 항목 | 내용 |
|------|------|
| **URL** | `GET /api/admin/reports` |
| **인증** | 필요 |
| **권한** | ADMIN |

#### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `status` | String | ❌ | 상태 필터 (`PENDING`, `RESOLVED`, `REJECTED`) |
| `targetType` | String | ❌ | 대상 타입 필터 (`REVIEW`, `POST`, `COMMENT`) |
| `page` | int | ❌ | 페이지 번호 (기본값: 1) |
| `size` | int | ❌ | 페이지 크기 (기본값: 10) |

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "targetType": "REVIEW",
        "targetId": 15,
        "reason": "SPAM",
        "description": "광고성 리뷰입니다.",
        "status": "PENDING",
        "action": null,
        "adminNote": null,
        "reporterNickname": "사용자123",
        "createdAt": "2026-04-05T14:30:00",
        "processedAt": null
      }
    ],
    "totalPages": 3,
    "totalElements": 28,
    "pendingCount": 5,
    "resolvedCount": 18,
    "rejectedCount": 5
  }
}
```

### 3. 신고 처리 — 답변 기반 (API_ADM_0053) ✨ 신규

| 항목 | 내용 |
|------|------|
| **URL** | `PATCH /api/admin/reports/{reportId}/process` |
| **인증** | 필요 |
| **권한** | ADMIN |

#### Request Body

```json
{
  "actionType": "DELETE",
  "message": "신고하신 콘텐츠를 확인한 결과, 스팸성 콘텐츠로 판단되어 삭제 처리하였습니다."
}
```

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `actionType` | String | ✅ | 처리 유형 (`DELETE`, `DISMISS`) |
| `message` | String | ✅ | 관리자 답변 (최소 10자, 신고자에게 전달) |

#### Response (200 OK)

```json
{
  "success": true,
  "data": "신고가 처리되었습니다."
}
```

#### 실패 (400 Bad Request)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "status": 400,
    "message": "처리 답변은 필수입니다.",
    "detail": "message 필드가 비어있습니다."
  }
}
```

### 4. 신고 처리 — 레거시 (API_ADM_0052) 🔧 하위호환

| 항목 | 내용 |
|------|------|
| **URL** | `PATCH /api/admin/reports/{reportId}` |
| **인증** | 필요 |
| **권한** | ADMIN |

#### Request Body

```json
{
  "action": "DELETE",
  "adminNote": "스팸 콘텐츠 삭제"
}
```

> ⚠️ 레거시 API입니다. 새로운 프론트엔드에서는 `PATCH /{id}/process`를 사용합니다.
