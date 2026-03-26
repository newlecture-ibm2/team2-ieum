# 🎪 축제 API (Festival)

> 축제 조회, 검색, 상세 정보 관련 API

**Base URL**: `/api/festivals`  
**권한**: 누구나 접근 가능 (비회원 허용)

---

## 1. 축제 목록 조회

| 항목 | 내용 |
|------|------|
| **URL** | `GET /api/festivals` |
| **인증** | 불필요 |
| **권한** | ANYONE |

### Query Parameters

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| `page` | Integer | ❌ | 0 | 페이지 번호 (0부터 시작) |
| `size` | Integer | ❌ | 10 | 페이지 크기 |
| `sort` | String | ❌ | `startDate,asc` | 정렬 기준 |
| `region` | String | ❌ | - | 시/도 필터 (예: `서울특별시`) |
| `status` | String | ❌ | - | 진행 상태 (`UPCOMING`, `ONGOING`, `ENDED`) |
| `keyword` | String | ❌ | - | 검색 키워드 (축제명, 장소) |

### Response (200 OK)

```json
{
  "code": 200,
  "data": {
    "content": [
      {
        "id": 1,
        "title": "2026 벚꽃 축제",
        "location": "서울특별시 여의도",
        "address": "서울특별시 영등포구 여의도동",
        "startDate": "2026-04-01",
        "endDate": "2026-04-10",
        "status": "UPCOMING",
        "thumbnailUrl": "https://example.com/festival1.jpg",
        "avgRating": 4.5,
        "reviewCount": 120,
        "latitude": 37.5219,
        "longitude": 126.9245
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 56,
    "totalPages": 6,
    "last": false
  }
}
```

---

## 2. 축제 상세 조회

| 항목 | 내용 |
|------|------|
| **URL** | `GET /api/festivals/{festivalId}` |
| **인증** | 불필요 |
| **권한** | ANYONE |

### Path Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `festivalId` | Long | ✅ | 축제 ID |

### Response (200 OK)

```json
{
  "code": 200,
  "data": {
    "id": 1,
    "title": "2026 벚꽃 축제",
    "description": "봄을 맞아 여의도에서 열리는 벚꽃 축제입니다.",
    "location": "서울특별시 여의도 한강공원",
    "address": "서울특별시 영등포구 여의도동 123",
    "startDate": "2026-04-01",
    "endDate": "2026-04-10",
    "status": "UPCOMING",
    "imageUrl": "https://example.com/festival1_detail.jpg",
    "thumbnailUrl": "https://example.com/festival1.jpg",
    "homepage": "https://festival.example.com",
    "tel": "02-1234-5678",
    "avgRating": 4.5,
    "reviewCount": 120,
    "latitude": 37.5219,
    "longitude": 126.9245,
    "createdAt": "2026-03-20T10:00:00",
    "updatedAt": "2026-03-25T15:00:00"
  }
}
```

#### 실패 (404 Not Found)

```json
{
  "code": 404,
  "message": "축제를 찾을 수 없습니다."
}
```

---

## 3. 지도용 축제 마커 조회

| 항목 | 내용 |
|------|------|
| **URL** | `GET /api/festivals/map` |
| **인증** | 불필요 |
| **권한** | ANYONE |

### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `swLat` | Double | ✅ | 남서쪽 위도 (지도 영역) |
| `swLng` | Double | ✅ | 남서쪽 경도 |
| `neLat` | Double | ✅ | 북동쪽 위도 |
| `neLng` | Double | ✅ | 북동쪽 경도 |
| `status` | String | ❌ | 진행 상태 필터 |

### Response (200 OK)

```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "title": "2026 벚꽃 축제",
      "latitude": 37.5219,
      "longitude": 126.9245,
      "status": "UPCOMING",
      "thumbnailUrl": "https://example.com/festival1.jpg"
    }
  ]
}
```

---

## 4. 시/도별 축제 목록 조회

| 항목 | 내용 |
|------|------|
| **URL** | `GET /api/festivals/regions` |
| **인증** | 불필요 |
| **권한** | ANYONE |

### Response (200 OK)

```json
{
  "code": 200,
  "data": [
    {
      "region": "서울특별시",
      "count": 15
    },
    {
      "region": "부산광역시",
      "count": 12
    }
  ]
}
```

---

## 5. 달력용 축제 조회

| 항목 | 내용 |
|------|------|
| **URL** | `GET /api/festivals/calendar` |
| **인증** | 불필요 |
| **권한** | ANYONE |

### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `year` | Integer | ✅ | 연도 |
| `month` | Integer | ✅ | 월 (1~12) |

### Response (200 OK)

```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "title": "2026 벚꽃 축제",
      "startDate": "2026-04-01",
      "endDate": "2026-04-10",
      "region": "서울특별시",
      "status": "UPCOMING"
    }
  ]
}
```
