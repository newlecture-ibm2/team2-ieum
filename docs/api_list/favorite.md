# ❤️ 즐겨찾기 API (Favorite)

> 관심 축제 즐겨찾기 관련 API

**Base URL**: `/api/favorites`  
**권한**: USER (회원 전용)

---

## 1. 즐겨찾기 목록 조회

| 항목 | 내용 |
|------|------|
| **URL** | `GET /api/favorites` |
| **인증** | 필요 |
| **권한** | USER |

### Request Headers

```
Authorization: Bearer {accessToken}
```

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
        "festival": {
          "id": 5,
          "title": "2026 벚꽃 축제",
          "location": "서울특별시 여의도",
          "startDate": "2026-04-01",
          "endDate": "2026-04-10",
          "status": "UPCOMING",
          "thumbnailUrl": "https://example.com/festival.jpg"
        },
        "createdAt": "2026-03-25T10:00:00"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 3,
    "totalPages": 1
  }
}
```

---

## 2. 즐겨찾기 추가

| 항목 | 내용 |
|------|------|
| **URL** | `POST /api/favorites` |
| **인증** | 필요 |
| **권한** | USER |

### Request Headers

```
Authorization: Bearer {accessToken}
```

### Request Body

```json
{
  "festivalId": 5
}
```

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `festivalId` | Long | ✅ | 축제 ID |

### Response (201 Created)

```json
{
  "code": 201,
  "message": "즐겨찾기에 추가되었습니다.",
  "data": {
    "id": 1,
    "festivalId": 5
  }
}
```

#### 실패 (409 Conflict)

```json
{
  "code": 409,
  "message": "이미 즐겨찾기에 추가된 축제입니다."
}
```

---

## 3. 즐겨찾기 삭제

| 항목 | 내용 |
|------|------|
| **URL** | `DELETE /api/favorites/{favoriteId}` |
| **인증** | 필요 |
| **권한** | USER (본인만) |

### Path Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `favoriteId` | Long | ✅ | 즐겨찾기 ID |

### Response (204 No Content)

> 응답 본문 없음

---

## 4. 즐겨찾기 여부 확인

| 항목 | 내용 |
|------|------|
| **URL** | `GET /api/favorites/check` |
| **인증** | 필요 |
| **권한** | USER |

### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `festivalId` | Long | ✅ | 축제 ID |

### Response (200 OK)

```json
{
  "code": 200,
  "data": {
    "isFavorite": true,
    "favoriteId": 1
  }
}
```
