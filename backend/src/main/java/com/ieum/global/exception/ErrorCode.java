package com.ieum.global.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * [공통 에러 코드 사전]
 * 프로젝트 전체에서 발생할 수 있는 에러를 코드(AUTH_001 등) + HTTP 상태 + 사용자 메시지로 미리 정의합니다.
 * 새로운 에러가 필요하면 이 enum에 한 줄 추가하면 됩니다.
 *
 * 사용 예시: throw new BusinessException(ErrorCode.AUTH_001, "상세 원인");
 */
@Getter
public enum ErrorCode {
    AUTH_001(HttpStatus.UNAUTHORIZED, "로그인이 필요한 서비스입니다."),
    AUTH_002(HttpStatus.FORBIDDEN, "해당 리소스에 대한 권한이 없습니다."),
    POST_001(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."),
    COMMENT_001(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다."),
    REPORT_001(HttpStatus.CONFLICT, "이미 신고한 대상입니다."),
    NOTICE_001(HttpStatus.NOT_FOUND, "공지사항을 찾을 수 없습니다."),
    NOTICE_002(HttpStatus.FORBIDDEN, "현재 게시 중인 공지사항이 아니거나 접근할 수 없습니다."),
    USER_001(HttpStatus.FORBIDDEN, "활동이 정지된 계정입니다. 정지 해제 후 이용해 주세요."),
    COMMON_001(HttpStatus.BAD_REQUEST, "잘못된 요청입니다."),
    FILE_001(HttpStatus.NOT_FOUND, "파일을 찾을 수 없습니다.");

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }
}
