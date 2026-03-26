# ⭐ 리뷰 API (Review)

> 축제 리뷰 / 별점 관련 API

**Base URL**: `/api/reviews`  
**권한**: 조회는 누구나, 작성/수정/삭제는 USER

---

## 1. 축제별 리뷰 목록 조회

| 항목 | 내용 |
|------|------|
| **URL** | `GET /api/festivals/{festivalId}/reviews` |
| **인증** | 불필요 |
| **권한** | ANYONE |

### Path Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `festivalId` | Long | ✅ | 축제 ID |

### Query Parameters

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| `page` | Integer | ❌ | 0 | 페이지 번호 |
| `size` | Integer | ❌ | 10 | 페이지 크기 |
| `sort` | String | ❌ | `createdAt,desc` | 정렬 기준 |

### Response (200 OK)

```json
{
  "code": 200,
  "data": {
    "content": [
      {
        "id": 1,
        "rating": 5,
        "content": "정말 좋은 축제였습니다! 내년에도 꼭 가고 싶어요.",
        "author": {
          "id": 1,
          "nickname": "축제매니아"
        },
        "createdAt": "2026-03-25T14:30:00",
        "updatedAt": null
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 45,
    "totalPages": 5
  }
}
```

---

## 2. 리뷰 작성

| 항목 | 내용 |
|------|------|
| **URL** | `POST /api/festivals/{festivalId}/reviews` |
| **인증** | 필요 |
| **권한** | USER |

### Request Headers

```
Authorization: Bearer {accessToken}
```

### Request Body

```json
{
  "rating": 5,
  "content": "정말 좋은 축제였습니다!"
}
```

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `rating` | Integer | ✅ | 별점 (1~5) |
| `content` | String | ✅ | 리뷰 내용 (10~500자) |

### Response (201 Created)

```json
{
  "code": 201,
  "message": "리뷰가 등록되었습니다.",
  "data": {
    "id": 46,
    "rating": 5,
    "content": "정말 좋은 축제였습니다!",
    "createdAt": "2026-03-26T10:00:00"
  }
}
```

---

## 3. 리뷰 수정

| 항목 | 내용 |
|------|------|
| **URL** | `PUT /api/reviews/{reviewId}` |
| **인증** | 필요 |
| **권한** | USER (본인만) |

### Request Headers

```
Authorization: Bearer {accessToken}
```

### Request Body

```json
{
  "rating": 4,
  "content": "수정된 리뷰 내용입니다."
}
```

### Response (200 OK)

```json
{
  "code": 200,
  "message": "리뷰가 수정되었습니다.",
  "data": {
    "id": 46,
    "rating": 4,
    "content": "수정된 리뷰 내용입니다.",
    "updatedAt": "2026-03-26T11:00:00"
  }
}
```

---

## 4. 리뷰 삭제

| 항목 | 내용 |
|------|------|
| **URL** | `DELETE /api/reviews/{reviewId}` |
| **인증** | 필요 |
| **권한** | USER (본인만) / ADMIN |

### Request Headers

```
Authorization: Bearer {accessToken}
```

### Response (204 No Content)

> 응답 본문 없음
