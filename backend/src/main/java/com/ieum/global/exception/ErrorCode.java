package com.ieum.global.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    COMMON_500(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다."),
    FEST_001(HttpStatus.INTERNAL_SERVER_ERROR, "공공데이터 동기화 통신에 실패했습니다."),
    FEST_002(HttpStatus.UNAUTHORIZED, "외부 공개 API 인증/권한 실패. API Key를 확인하세요.");

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }

    public HttpStatus getStatus() { return status; }
    public String getMessage() { return message; }
    public String getCode() { return this.name(); }
}
