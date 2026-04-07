package com.ieum.global.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    AUTH_001(HttpStatus.UNAUTHORIZED, "로그인이 필요한 서비스입니다."),
    AUTH_002(HttpStatus.FORBIDDEN, "해당 리소스에 대한 권한이 없습니다."),
    POST_001(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."),
    COMMENT_001(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다."),
    REPORT_001(HttpStatus.CONFLICT, "이미 신고한 대상입니다."),
    COMMON_001(HttpStatus.BAD_REQUEST, "잘못된 요청입니다.");

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }
}
