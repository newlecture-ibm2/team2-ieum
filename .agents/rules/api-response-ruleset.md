---
description: 이음(ieum) 프로젝트 API 응답/에러 공통 룰셋 — 사용자 메시지 & 개발자 상세 설명 표준
---

# API 응답 & 에러 처리 룰셋

> 상세 에러 코드표는 `docs/api_list/error-codes.md` 참고.

## 1. 응답 포맷

성공: `{ "success": true, "data": { ... }, "error": null }`

실패:
```json
{
  "success": false, "data": null,
  "error": {
    "code": "AUTH_001", "status": 401,
    "message": "로그인이 필요한 서비스입니다.",
    "detail": "Access token is missing or expired",
    "timestamp": "2026-04-01T10:00:00",
    "errors": []
  }
}
```

- `message` = 사용자용 한글 (UI 표시)
- `detail` = 개발자용 영문 (프론트 노출 금지, 로그 전용)
- `errors` = 필드별 유효성 에러 배열 (400일 때만)

## 2. 성공 message 규칙

- **200 조회**: message 생략, data만 반환
- **200 수정**: `"{리소스}이(가) 수정되었습니다."`
- **201 생성**: `"{리소스}이(가) 등록되었습니다."`
- **204 삭제**: 응답 본문 없음, 프론트 자체 토스트
- **토글**: 상태별 분기 ex) `"즐겨찾기에 추가/제거되었습니다."`

## 3. 에러 코드 네이밍

`{도메인}_{순번3자리}` — AUTH_001, FEST_001, REVIEW_003 등

도메인: AUTH, USER, FEST, REVIEW, FAV, POST, COMMENT, NOTICE, INQ, REPORT, FILE, COMMON

## 4. HTTP Status별 프론트 처리

- **200/201**: 성공 토스트 (초록, 2초)
- **204**: 프론트 토스트 + 목록 새로고침
- **400**: 인라인 에러 또는 경고 토스트 (노랑)
- **401**: 토큰 재발급 시도 → 실패 시 로그인 리다이렉트 (빨강)
- **403**: 경고 토스트 + 이전 페이지 (빨강)
- **404**: 404 페이지 또는 토스트 + 목록 이동 (노랑)
- **409**: 경고 토스트 — 중복 안내 (노랑)
- **500**: 에러 토스트 + 재시도 버튼 (빨강)

## 5. 백엔드 구현 패턴

ErrorCode Enum에 사용자 message를 정의하고 BusinessException에서 detail을 전달:

```java
// ErrorCode.java
AUTH_001(HttpStatus.UNAUTHORIZED, "로그인이 필요한 서비스입니다."),

// Service에서 예외 발생
throw new BusinessException(ErrorCode.REVIEW_003, "userId=" + userId);

// GlobalExceptionHandler
ApiResponse.error(code, status, message, detail);
```

## 6. 작성 원칙

- **message**: 한글 존칭, UI에 그대로 표시 가능한 문장
- **detail**: 영문, 변수 값 포함, 로그 전용
