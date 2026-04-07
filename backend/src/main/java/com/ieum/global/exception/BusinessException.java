package com.ieum.global.exception;

import lombok.Getter;

/**
 * [커스텀 비즈니스 예외]
 * 서비스 로직에서 "의도적으로" 던지는 예외 클래스입니다.
 * ErrorCode를 담고 있어, GlobalExceptionHandler가 이를 잡아 적절한 HTTP 상태 + JSON 에러 응답을 반환합니다.
 *
 * 사용 예시:
 *   - throw new BusinessException(ErrorCode.POST_001);              // 기본 메시지만
 *   - throw new BusinessException(ErrorCode.AUTH_001, "상세 설명");   // 개발자용 상세 메시지 추가
 */
@Getter
public class BusinessException extends RuntimeException {
    private final ErrorCode errorCode;
    private final String detail;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.detail = errorCode.getMessage();
    }

    public BusinessException(ErrorCode errorCode, String detail) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.detail = detail;
    }
}
