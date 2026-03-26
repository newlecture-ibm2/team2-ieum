# 🚨 신고 API (Report)

> 부적절한 콘텐츠 신고 관련 API

**Base URL**: `/api/reports`  
**권한**: USER (회원 전용)

---

## 신고 대상 타입

| 타입 코드 | 설명 |
|-----------|------|
| `REVIEW` | 리뷰 신고 |
| `POST` | 게시글 신고 |
| `COMMENT` | 댓글 신고 |

## 신고 사유

| 사유 코드 | 설명 |
|-----------|------|
| `SPAM` | 스팸/광고 |
| `ABUSE` | 욕설/비방 |
| `INAPPROPRIATE` | 부적절한 내용 |
| `FALSE_INFO` | 허위 정보 |
| `OTHER` | 기타 |

---

## 1. 신고 접수

| 항목 | 내용 |
|------|------|
| **URL** | `POST /api/reports` |
| **인증** | 필요 |
| **권한** | USER |

### Request Headers

```
Authorization: Bearer {accessToken}
```

### Request Body

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

### Response (201 Created)

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
