# 💬 커뮤니티 API (Community)

> 커뮤니티 게시판 관련 API (Q&A / 축제 꿀팁 / 먹거리)

**Base URL**: `/api/community`  
**권한**: 조회는 누구나, 작성/수정/삭제는 USER

---

## 게시판 카테고리

| 카테고리 코드 | 설명 |
|---------------|------|
| `QNA` | Q&A 게시판 |
| `TIP` | 축제 꿀팁 게시판 |
| `FOOD` | 먹거리 게시판 |

---

## 1. 게시글 목록 조회

| 항목 | 내용 |
|------|------|
| **URL** | `GET /api/community/posts` |
| **인증** | 불필요 |
| **권한** | ANYONE |

### Query Parameters

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| `category` | String | ❌ | - | 카테고리 (`QNA`, `TIP`, `FOOD`) |
| `page` | Integer | ❌ | 0 | 페이지 번호 |
| `size` | Integer | ❌ | 10 | 페이지 크기 |
| `sort` | String | ❌ | `createdAt,desc` | 정렬 기준 |
| `keyword` | String | ❌ | - | 검색 키워드 (제목, 내용) |

### Response (200 OK)

```json
{
  "code": 200,
  "data": {
    "content": [
      {
        "id": 1,
        "category": "TIP",
        "title": "벚꽃 축제 가기 전 꼭 알아야 할 것들",
        "content": "1. 주차는 미리 예약하세요...",
        "author": {
          "id": 1,
          "nickname": "축제매니아"
        },
        "viewCount": 234,
        "commentCount": 15,
        "createdAt": "2026-03-25T14:30:00"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 120,
    "totalPages": 12
  }
}
```

---

## 2. 게시글 상세 조회

| 항목 | 내용 |
|------|------|
| **URL** | `GET /api/community/posts/{postId}` |
| **인증** | 불필요 |
| **권한** | ANYONE |

### Response (200 OK)

```json
{
  "code": 200,
  "data": {
    "id": 1,
    "category": "TIP",
    "title": "벚꽃 축제 가기 전 꼭 알아야 할 것들",
    "content": "1. 주차는 미리 예약하세요. 2. 돗자리는 필수!...",
    "author": {
      "id": 1,
      "nickname": "축제매니아"
    },
    "viewCount": 235,
    "commentCount": 15,
    "createdAt": "2026-03-25T14:30:00",
    "updatedAt": null,
    "comments": [
      {
        "id": 1,
        "content": "좋은 정보 감사합니다!",
        "author": {
          "id": 2,
          "nickname": "봄나들이"
        },
        "createdAt": "2026-03-25T15:00:00"
      }
    ]
  }
}
```

---

## 3. 게시글 작성

| 항목 | 내용 |
|------|------|
| **URL** | `POST /api/community/posts` |
| **인증** | 필요 |
| **권한** | USER |

### Request Body

```json
{
  "category": "TIP",
  "title": "벚꽃 축제 준비물 리스트",
  "content": "벚꽃 축제에 가기 전 준비해야 할 것들을 정리했습니다."
}
```

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `category` | String | ✅ | 카테고리 (`QNA`, `TIP`, `FOOD`) |
| `title` | String | ✅ | 제목 (2~100자) |
| `content` | String | ✅ | 내용 (10~5000자) |

### Response (201 Created)

```json
{
  "code": 201,
  "message": "게시글이 등록되었습니다.",
  "data": {
    "id": 121,
    "category": "TIP",
    "title": "벚꽃 축제 준비물 리스트",
    "createdAt": "2026-03-26T10:00:00"
  }
}
```

---

## 4. 게시글 수정

| 항목 | 내용 |
|------|------|
| **URL** | `PUT /api/community/posts/{postId}` |
| **인증** | 필요 |
| **권한** | USER (본인만) |

### Request Body

```json
{
  "title": "수정된 제목",
  "content": "수정된 내용"
}
```

### Response (200 OK)

```json
{
  "code": 200,
  "message": "게시글이 수정되었습니다."
}
```

---

## 5. 게시글 삭제

| 항목 | 내용 |
|------|------|
| **URL** | `DELETE /api/community/posts/{postId}` |
| **인증** | 필요 |
| **권한** | USER (본인만) / ADMIN |

### Response (204 No Content)

> 응답 본문 없음

---

## 6. 댓글 작성

| 항목 | 내용 |
|------|------|
| **URL** | `POST /api/community/posts/{postId}/comments` |
| **인증** | 필요 |
| **권한** | USER |

### Request Body

```json
{
  "content": "좋은 정보 감사합니다!"
}
```

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `content` | String | ✅ | 댓글 내용 (1~1000자) |

### Response (201 Created)

```json
{
  "code": 201,
  "message": "댓글이 등록되었습니다.",
  "data": {
    "id": 16,
    "content": "좋은 정보 감사합니다!",
    "createdAt": "2026-03-26T10:30:00"
  }
}
```

---

## 7. 댓글 수정

| 항목 | 내용 |
|------|------|
| **URL** | `PUT /api/community/comments/{commentId}` |
| **인증** | 필요 |
| **권한** | USER (본인만) |

### Request Body

```json
{
  "content": "수정된 댓글 내용"
}
```

### Response (200 OK)

```json
{
  "code": 200,
  "message": "댓글이 수정되었습니다."
}
```

---

## 8. 댓글 삭제

| 항목 | 내용 |
|------|------|
| **URL** | `DELETE /api/community/comments/{commentId}` |
| **인증** | 필요 |
| **권한** | USER (본인만) / ADMIN |

### Response (204 No Content)

> 응답 본문 없음
