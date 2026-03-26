# 📢 공지사항 API (Notice)

> 공지사항 조회 관련 API

**Base URL**: `/api/notices`  
**권한**: 누구나 접근 가능

---

## 1. 공지사항 목록 조회

| 항목 | 내용 |
|------|------|
| **URL** | `GET /api/notices` |
| **인증** | 불필요 |
| **권한** | ANYONE |

### Query Parameters

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| `page` | Integer | ❌ | 0 | 페이지 번호 |
| `size` | Integer | ❌ | 10 | 페이지 크기 |

### Response (200 OK)

```json
{
  "code": 200,
  "data": {
    "content": [
      {
        "id": 1,
        "title": "[공지] 서비스 오픈 안내",
        "content": "이음 서비스가 정식 오픈되었습니다.",
        "isPinned": true,
        "viewCount": 1024,
        "createdAt": "2026-03-25T09:00:00"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 5,
    "totalPages": 1
  }
}
```

---

## 2. 공지사항 상세 조회

| 항목 | 내용 |
|------|------|
| **URL** | `GET /api/notices/{noticeId}` |
| **인증** | 불필요 |
| **권한** | ANYONE |

### Path Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `noticeId` | Long | ✅ | 공지사항 ID |

### Response (200 OK)

```json
{
  "code": 200,
  "data": {
    "id": 1,
    "title": "[공지] 서비스 오픈 안내",
    "content": "이음 서비스가 정식 오픈되었습니다. 많은 이용 부탁드립니다.",
    "isPinned": true,
    "viewCount": 1025,
    "createdAt": "2026-03-25T09:00:00",
    "updatedAt": null
  }
}
```
