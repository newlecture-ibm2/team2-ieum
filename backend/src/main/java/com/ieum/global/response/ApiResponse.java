package com.ieum.global.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 전역 응답 공통 포맷 객체
 * api-response-ruleset.md 기준을 준수
 */
@Getter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class ApiResponse<T> {

    private final boolean success;
    private final T data;
    private final ErrorResponse error;

    // 성공 응답 전용 (data만 반환)
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null);
    }

    // 데이터가 없는 성공 (토글, 삭제 등)
    public static ApiResponse<Void> success() {
        return new ApiResponse<>(true, null, null);
    }

    // 에러 발생 시 공통 응답 규격 반환용
    public static <T> ApiResponse<T> error(ErrorResponse errorResponse) {
        return new ApiResponse<>(false, null, errorResponse);
    }

    // 에러 응답용 정적 구조체
    @Getter
    @AllArgsConstructor(staticName = "of")
    public static class ErrorResponse {
        private final String code;
        private final int status;
        private final String message;
        private final String detail;
    }
}
