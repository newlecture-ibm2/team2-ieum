# 🏛️ 공공데이터 — 한국관광공사 국문 관광정보 서비스 API

> 공공데이터포털에서 제공하는 TourAPI를 활용하여 전국 축제/행사 정보를 수집합니다.

---

## 📌 기본 정보

| 항목 | 내용 |
|------|------|
| **서비스명** | 한국관광공사_국문 관광정보 서비스_GW |
| **공공데이터포털** | https://www.data.go.kr/data/15101578/openapi.do |
| **Base URL** | `https://apis.data.go.kr/B551011/KorService2` |
| **응답 형식** | XML (기본), JSON (`_type=json` 추가 시) |
| **인증 방식** | 서비스키 (`serviceKey`) — 공공데이터포털에서 발급 |

---

## 🔑 인증키 관리

> ⚠️ **인증키는 절대 소스코드에 직접 하드코딩하지 마세요!**

### 환경 변수 설정

```bash
# backend 환경 변수 (.env 또는 application.yml)
TOUR_API_SERVICE_KEY=발급받은_인코딩키_또는_디코딩키
```

### Spring Boot 설정 (application.yml)

```yaml
tour-api:
  service-key: ${TOUR_API_SERVICE_KEY}
  base-url: https://apis.data.go.kr/B551011/KorService2
```

### .gitignore에 추가

```
# 환경 변수 파일
.env
application-local.yml
```

---

## 📐 공통 요청 파라미터

모든 API 호출 시 아래 파라미터는 **필수**입니다.

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `serviceKey` | String | ✅ | 공공데이터포털에서 발급받은 인증키 |
| `MobileOS` | String | ✅ | OS 구분 (`ETC` — 웹서버 호출 시) |
| `MobileApp` | String | ✅ | 서비스명 (예: `ieum`) |
| `_type` | String | ❌ | 응답 형식 (`json` 권장, 기본 XML) |
| `numOfRows` | Integer | ❌ | 한 페이지 결과 수 (기본: 10) |
| `pageNo` | Integer | ❌ | 페이지 번호 (기본: 1) |

---

## 🗂️ 사용할 주요 오퍼레이션

이음 프로젝트에서 활용할 API 목록입니다.

| # | 오퍼레이션 | 용도 | 우선순위 |
|---|-----------|------|----------|
| 1 | `searchFestival1` | 행사/축제 정보 조회 | ⭐ 핵심 |
| 2 | `areaBasedList1` | 지역 기반 관광정보 목록 | ⭐ 핵심 |
| 3 | `detailCommon1` | 공통 상세 정보 조회 | ⭐ 핵심 |
| 4 | `detailIntro1` | 소개 상세 정보 조회 | 🔵 중요 |
| 5 | `detailImage1` | 이미지 정보 조회 | 🔵 중요 |
| 6 | `areaCode1` | 지역 코드 조회 | 🟢 보조 |
| 7 | `searchKeyword1` | 키워드 검색 | 🟢 보조 |
| 8 | `locationBasedList1` | 위치 기반 관광정보 | 🟢 보조 |

---

## ⭐ 1. 행사/축제 정보 조회 (`searchFestival1`)

> 날짜 기반으로 전국 축제/행사 정보를 조회합니다. **이음 프로젝트의 핵심 API**

| 항목 | 내용 |
|------|------|
| **URL** | `GET /searchFestival1` |
| **Full URL** | `https://apis.data.go.kr/B551011/KorService2/searchFestival1` |

### Request Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `eventStartDate` | String | ✅ | 행사 시작일 (YYYYMMDD) |
| `eventEndDate` | String | ❌ | 행사 종료일 (YYYYMMDD) |
| `areaCode` | String | ❌ | 지역코드 (아래 코드표 참조) |
| `sigunguCode` | String | ❌ | 시군구코드 |
| `arrange` | String | ❌ | 정렬 (`A`=제목순, `C`=수정일순, `D`=생성일순, `O`=제목순(대표이미지있는것), `Q`=수정일순(대표이미지), `R`=생성일순(대표이미지)) |
| `listYN` | String | ❌ | 목록 구분 (`Y`=목록, `N`=개수) |
| `numOfRows` | Integer | ❌ | 한 페이지 결과 수 |
| `pageNo` | Integer | ❌ | 페이지 번호 |

### 호출 예시

```
GET https://apis.data.go.kr/B551011/KorService2/searchFestival1
  ?serviceKey={인증키}
  &MobileOS=ETC
  &MobileApp=ieum
  &_type=json
  &eventStartDate=20260401
  &eventEndDate=20260430
  &areaCode=1
  &numOfRows=10
  &pageNo=1
  &arrange=A
  &listYN=Y
```

### Response (JSON)

```json
{
  "response": {
    "header": {
      "resultCode": "0000",
      "resultMsg": "OK"
    },
    "body": {
      "items": {
        "item": [
          {
            "contentid": "2945034",
            "contenttypeid": "15",
            "title": "2026 여의도 벚꽃축제",
            "addr1": "서울특별시 영등포구 여의도동",
            "addr2": "한강공원 일대",
            "areacode": "1",
            "sigungucode": "20",
            "tel": "02-1234-5678",
            "firstimage": "https://tong.visitkorea.or.kr/cms/resource/...",
            "firstimage2": "https://tong.visitkorea.or.kr/cms/resource/...",
            "eventstartdate": "20260401",
            "eventenddate": "20260410",
            "mapx": "126.9245",
            "mapy": "37.5219",
            "modifiedtime": "20260320150000",
            "createdtime": "20260101100000"
          }
        ]
      },
      "numOfRows": 10,
      "pageNo": 1,
      "totalCount": 56
    }
  }
}
```

### 응답 필드 매핑 (TourAPI → 이음 DB)

| TourAPI 필드 | 타입 | 이음 DB 필드 | 설명 |
|-------------|------|-------------|------|
| `contentid` | String | `external_id` | 콘텐츠 고유 ID |
| `contenttypeid` | String | `content_type_id` | 콘텐츠 타입 (15=축제) |
| `title` | String | `title` | 축제명 |
| `addr1` | String | `address` | 주소 |
| `addr2` | String | `address_detail` | 상세주소 |
| `areacode` | String | `area_code` | 지역코드 |
| `sigungucode` | String | `sigungu_code` | 시군구코드 |
| `tel` | String | `tel` | 전화번호 |
| `firstimage` | String | `image_url` | 대표 이미지 (원본) |
| `firstimage2` | String | `thumbnail_url` | 썸네일 이미지 |
| `eventstartdate` | String | `start_date` | 행사 시작일 |
| `eventenddate` | String | `end_date` | 행사 종료일 |
| `mapx` | String | `longitude` | 경도 (X좌표) |
| `mapy` | String | `latitude` | 위도 (Y좌표) |

---

## ⭐ 2. 지역 기반 관광정보 조회 (`areaBasedList1`)

> 지역 기반으로 관광정보 목록을 조회합니다.

| 항목 | 내용 |
|------|------|
| **URL** | `GET /areaBasedList1` |
| **Full URL** | `https://apis.data.go.kr/B551011/KorService2/areaBasedList1` |

### Request Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `contentTypeId` | String | ❌ | 콘텐츠 타입 ID (15=축제/행사) |
| `areaCode` | String | ❌ | 지역코드 |
| `sigunguCode` | String | ❌ | 시군구코드 |
| `cat1` | String | ❌ | 대분류 코드 |
| `cat2` | String | ❌ | 중분류 코드 |
| `cat3` | String | ❌ | 소분류 코드 |
| `arrange` | String | ❌ | 정렬 기준 |

### 호출 예시

```
GET https://apis.data.go.kr/B551011/KorService2/areaBasedList1
  ?serviceKey={인증키}
  &MobileOS=ETC
  &MobileApp=ieum
  &_type=json
  &contentTypeId=15
  &areaCode=1
  &numOfRows=10
  &pageNo=1
```

---

## ⭐ 3. 공통 상세 정보 조회 (`detailCommon1`)

> 콘텐츠 ID로 상세 정보를 조회합니다.

| 항목 | 내용 |
|------|------|
| **URL** | `GET /detailCommon1` |
| **Full URL** | `https://apis.data.go.kr/B551011/KorService2/detailCommon1` |

### Request Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `contentId` | String | ✅ | 콘텐츠 ID |
| `contentTypeId` | String | ❌ | 콘텐츠 타입 ID |
| `defaultYN` | String | ❌ | 기본정보 조회 (`Y`/`N`) |
| `firstImageYN` | String | ❌ | 대표이미지 조회 (`Y`/`N`) |
| `areacodeYN` | String | ❌ | 지역코드 조회 (`Y`/`N`) |
| `addrinfoYN` | String | ❌ | 주소 조회 (`Y`/`N`) |
| `mapinfoYN` | String | ❌ | 좌표 조회 (`Y`/`N`) |
| `overviewYN` | String | ❌ | 개요 조회 (`Y`/`N`) |

### 호출 예시

```
GET https://apis.data.go.kr/B551011/KorService2/detailCommon1
  ?serviceKey={인증키}
  &MobileOS=ETC
  &MobileApp=ieum
  &_type=json
  &contentId=2945034
  &contentTypeId=15
  &defaultYN=Y
  &firstImageYN=Y
  &addrinfoYN=Y
  &mapinfoYN=Y
  &overviewYN=Y
```

### Response

```json
{
  "response": {
    "body": {
      "items": {
        "item": [
          {
            "contentid": "2945034",
            "contenttypeid": "15",
            "title": "2026 여의도 벚꽃축제",
            "addr1": "서울특별시 영등포구 여의도동",
            "overview": "매년 봄 여의도 윤중로를 중심으로 열리는...",
            "homepage": "<a href=\"https://...\">홈페이지</a>",
            "firstimage": "https://tong.visitkorea.or.kr/...",
            "mapx": "126.9245",
            "mapy": "37.5219",
            "tel": "02-1234-5678"
          }
        ]
      }
    }
  }
}
```

---

## 🔵 4. 소개 상세 정보 조회 (`detailIntro1`)

> 축제 타입별 상세 소개 정보 (기간, 장소, 주최 등)

| 항목 | 내용 |
|------|------|
| **URL** | `GET /detailIntro1` |
| **Full URL** | `https://apis.data.go.kr/B551011/KorService2/detailIntro1` |

### Request Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `contentId` | String | ✅ | 콘텐츠 ID |
| `contentTypeId` | String | ✅ | 콘텐츠 타입 ID (`15`=축제) |

### Response (contentTypeId=15 — 축제)

```json
{
  "response": {
    "body": {
      "items": {
        "item": [
          {
            "contentid": "2945034",
            "contenttypeid": "15",
            "sponsor1": "서울특별시",
            "sponsor1tel": "02-120",
            "sponsor2": "영등포구청",
            "eventstartdate": "20260401",
            "eventenddate": "20260410",
            "playtime": "10:00 ~ 21:00",
            "eventplace": "여의도 한강공원",
            "usetimefestival": "무료",
            "agelimit": "전 연령 가능",
            "program": "벚꽃 포토존, 야간 조명쇼, 먹거리 장터"
          }
        ]
      }
    }
  }
}
```

---

## 🔵 5. 이미지 정보 조회 (`detailImage1`)

> 콘텐츠의 추가 이미지 목록 조회

| 항목 | 내용 |
|------|------|
| **URL** | `GET /detailImage1` |
| **Full URL** | `https://apis.data.go.kr/B551011/KorService2/detailImage1` |

### Request Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `contentId` | String | ✅ | 콘텐츠 ID |
| `imageYN` | String | ❌ | 이미지 조회 (`Y`/`N`) |
| `subImageYN` | String | ❌ | 서브이미지 조회 (`Y`/`N`) |

### Response

```json
{
  "response": {
    "body": {
      "items": {
        "item": [
          {
            "contentid": "2945034",
            "originimgurl": "https://tong.visitkorea.or.kr/.../original.jpg",
            "smallimageurl": "https://tong.visitkorea.or.kr/.../small.jpg",
            "imgname": "벚꽃 축제 전경",
            "serialnum": "1"
          }
        ]
      }
    }
  }
}
```

---

## 🟢 6. 지역 코드 조회 (`areaCode1`)

> 시/도 및 시군구 코드 조회 (축제 필터링에 활용)

| 항목 | 내용 |
|------|------|
| **URL** | `GET /areaCode1` |
| **Full URL** | `https://apis.data.go.kr/B551011/KorService2/areaCode1` |

### Request Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `areaCode` | String | ❌ | 지역코드 (미입력시 시/도 목록 반환, 입력시 해당 시/도의 시군구 목록) |

### 시/도 코드표

| 코드 | 지역 | 코드 | 지역 |
|------|------|------|------|
| `1` | 서울 | `2` | 인천 |
| `3` | 대전 | `4` | 대구 |
| `5` | 광주 | `6` | 부산 |
| `7` | 울산 | `8` | 세종 |
| `31` | 경기도 | `32` | 강원특별자치도 |
| `33` | 충청북도 | `34` | 충청남도 |
| `35` | 경상북도 | `36` | 경상남도 |
| `37` | 전북특별자치도 | `38` | 전라남도 |
| `39` | 제주도 | | |

---

## 🟢 7. 키워드 검색 (`searchKeyword1`)

> 키워드로 관광정보를 검색합니다.

| 항목 | 내용 |
|------|------|
| **URL** | `GET /searchKeyword1` |
| **Full URL** | `https://apis.data.go.kr/B551011/KorService2/searchKeyword1` |

### Request Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `keyword` | String | ✅ | 검색 키워드 (UTF-8 URL 인코딩) |
| `contentTypeId` | String | ❌ | 콘텐츠 타입 ID |
| `areaCode` | String | ❌ | 지역코드 |
| `arrange` | String | ❌ | 정렬 기준 |

### 호출 예시

```
GET https://apis.data.go.kr/B551011/KorService2/searchKeyword1
  ?serviceKey={인증키}
  &MobileOS=ETC
  &MobileApp=ieum
  &_type=json
  &keyword=벚꽃축제
  &contentTypeId=15
  &numOfRows=10
  &pageNo=1
```

---

## 🟢 8. 위치 기반 관광정보 (`locationBasedList1`)

> GPS 좌표 기반으로 주변 관광정보를 조회합니다 (카카오맵 연동 시 활용)

| 항목 | 내용 |
|------|------|
| **URL** | `GET /locationBasedList1` |
| **Full URL** | `https://apis.data.go.kr/B551011/KorService2/locationBasedList1` |

### Request Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `mapX` | String | ✅ | 경도 (X좌표) |
| `mapY` | String | ✅ | 위도 (Y좌표) |
| `radius` | String | ❌ | 검색 반경 (m 단위, 기본 1000) |
| `contentTypeId` | String | ❌ | 콘텐츠 타입 ID |
| `arrange` | String | ❌ | 정렬 기준 (`E`=거리순) |

### 호출 예시

```
GET https://apis.data.go.kr/B551011/KorService2/locationBasedList1
  ?serviceKey={인증키}
  &MobileOS=ETC
  &MobileApp=ieum
  &_type=json
  &mapX=126.9245
  &mapY=37.5219
  &radius=5000
  &contentTypeId=15
  &arrange=E
```

---

## 📊 콘텐츠 타입 코드표

| contentTypeId | 관광 타입 | 이음 활용 |
|--------------|----------|----------|
| `12` | 관광지 | ❌ |
| `14` | 문화시설 | ❌ |
| **`15`** | **축제/공연/행사** | **✅ 핵심** |
| `25` | 여행코스 | ❌ |
| `28` | 레포츠 | ❌ |
| `32` | 숙박 | ❌ |
| `38` | 쇼핑 | ❌ |
| `39` | 음식점 | ❌ |

---

## ⚠️ 에러 코드

| resultCode | 의미 | 대응 |
|-----------|------|------|
| `0000` | 정상 | - |
| `0010` | 어플리케이션 에러 | 서비스키 확인 |
| `0011` | 서비스 제한 | 일일 호출량 초과 확인 |
| `0020` | 서비스 접근 거부 | 서비스키 권한 확인 |
| `0021` | 서비스 키 만료 | 키 재발급 |
| `0022` | 서비스 접속 차단 | IP 차단 여부 확인 |
| `0030` | 등록되지 않은 서비스키 | 키 확인 |
| `0031` | 활용 기간 만료 | 재신청 |

---

## 🔄 데이터 동기화 전략

### 초기 데이터 로딩

```
1. searchFestival1 → 전체 축제 목록 수집 (eventStartDate=20260101)
2. 각 축제별 detailCommon1 → 상세 정보 수집
3. 각 축제별 detailIntro1  → 소개 정보 수집  
4. 각 축제별 detailImage1  → 이미지 수집
5. DB 저장
```

### 정기 동기화 (일 1회 권장)

```
1. searchFestival1 호출 (최근 수정일 기준 정렬)
2. 신규/변경 축제만 detailCommon1 + detailIntro1 재조회
3. DB 업데이트 (upsert)
```

### 일일 호출량 제한

| 항목 | 제한 |
|------|------|
| 일반 인증키 | **1,000건/일** |
| 운영 인증키 | 신청에 따라 상향 가능 |

> 💡 개발 초기에는 일반 인증키로 충분하나, 운영 시에는 **운영 인증키 전환 신청** 필요
