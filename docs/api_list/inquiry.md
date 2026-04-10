# 📡 관리자 문의 관리 API 명세서

> **도메인 코드**: `ADM` (관리자 영역)  
> **담당자**: 수경  
> **최종 수정일**: 2026-04-06

---

## API 목록

| API ID | Method | Endpoint | 설명 | 인증 |
|--------|--------|----------|------|------|
| API_ADM_0070 | GET | `/api/admin/inquiries` | 문의 목록 조회 | 🔐 관리자 |
| API_ADM_0072 | POST | `/api/admin/inquiries/{inquiryId}/answer` | 문의 답변 등록 | 🔐 관리자 |

---

## API_ADM_0070: 문의 목록 조회

| 항목 | 내용 |
|------|------|
| **엔드포인트** | `GET /api/admin/inquiries` |
| **UseCase** | `GetInquiryListUseCase` |
| **Service** | `InquiryAdminService.getInquiries()` |
| **인증** | 🔐 관리자 |

### Query Parameters

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|------|-------|------|
| status | string | - | - | 상태 필터 (`PENDING` / `ANSWERED`) |
| searchType | string | - | `ALL` | 검색 기준 (`ALL` / `TITLE` / `AUTHOR` / `CONTENT`) |
| keyword | string | - | - | 검색 키워드 |
| page | int | - | 1 | 페이지 번호 |
| size | int | - | 10 | 페이지 크기 |

### Response (200)

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "title": "축제 정보 오류 문의",
        "content": "서울 벚꽃 축제 날짜가 실제와 다릅니다.",
        "status": "PENDING",
        "answer": null,
        "answeredAt": null,
        "authorNickname": "user01",
        "createdAt": "2026-04-05T14:30:00"
      }
    ],
    "totalPages": 1,
    "totalElements": 5,
    "pendingCount": 3,
    "answeredCount": 2
  }
}
```

---

## API_ADM_0072: 문의 답변 등록

| 항목 | 내용 |
|------|------|
| **엔드포인트** | `POST /api/admin/inquiries/{inquiryId}/answer` |
| **UseCase** | `AnswerInquiryUseCase` |
| **Service** | `InquiryAdminService.answerInquiry()` |
| **인증** | 🔐 관리자 |

### Request Body

```json
{
  "answer": "안녕하세요. 해당 축제 날짜를 확인하여 수정 반영하겠습니다. 감사합니다."
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| answer | string | ✅ | 관리자 답변 내용 (빈 문자열 불가) |

### Response (200)

```json
{
  "success": true,
  "data": "답변이 등록되었습니다."
}
```

### 에러

| 상태 | 코드 | 메시지 |
|------|------|--------|
| 400 | VALIDATION_ERROR | 답변 내용은 필수입니다. |

---

## 비즈니스 규칙

1. 답변 등록 시 `inquiries` 테이블의 `answer`, `status`(→ `ANSWERED`), `answered_at` 필드가 함께 업데이트됩니다.
2. 이미 답변 완료된 문의에 대한 재답변은 현재 허용하지 않습니다 (프론트엔드에서 readonly 처리).
3. 추가 테이블 없이 기존 `inquiries` 테이블의 `answer` 컬럼을 직접 사용합니다.
