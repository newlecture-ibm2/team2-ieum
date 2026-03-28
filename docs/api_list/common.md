# 🛠️ API 목록 — 공통 영역 (Common)

이 문서는 프로젝트 전반에서 공통으로 사용되는 API 및 전역 설정을 정의합니다.

---

## 1. 공통 API 목록

| API ID | Method | Endpoint | 설명 | 비고 |
|--------|--------|----------|------|------|
| API_COM_0010 | POST | `/api/common/upload` | 단일 파일 업로드 | 이미지, 첨부파일 등 |
| API_COM_0020 | POST | `/api/common/uploads` | 다중 파일 업로드 | 최대 5개 |
| API_COM_0030 | GET | `/api/common/codes/{groupCode}` | 그룹 코드별 상세 코드 조회 | 지역, 카테고리 등 |

---

## 2. 전역 응답 포맷 (Common Response)

모든 API 응답은 아래의 구조를 따릅니다.

### 성공 응답 (Success)
```json
{
  "code": 200,
  "message": "성공",
  "data": { ... }
}
```

### 실패 응답 (Error)
```json
{
  "code": 400,
  "message": "잘못된 요청입니다.",
  "errors": [
    {
      "field": "name",
      "message": "필수 입력값입니다."
    }
  ]
}
```

---

## 3. 전역 에러 코드 정의

| 코드 | HTTP Status | 의미 |
|------|-------------|------|
| `COMMON_001` | 400 | 잘못된 요청 파라미터 |
| `COMMON_002` | 500 | 서버 내부 오류 |
| `AUTH_001` | 401 | 인증이 필요합니다 |
| `AUTH_002` | 403 | 접근 권한이 없습니다 |
| `FILE_001` | 400 | 허용되지 않은 파일 형식 |
| `FILE_002` | 413 | 파일 크기 초과 (제한: 5MB) |

---

> **작성일**: 2026-03-28  
> **버전**: v1.0
