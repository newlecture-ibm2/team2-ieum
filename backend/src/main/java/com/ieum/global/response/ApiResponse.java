package com.ieum.global.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 공통 API 응답 래퍼 (공통응답포맷)
 * 모든 API 응답은 이 형식을 따른다.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    /** API 성공 여부 (true/false) */
    private boolean success;

    /** 실제 응답 데이터 본문 */
    private T data;

    /** 실패 시 에러 정보 (성공시 null) */
    private ErrorInfo error;

    /**
     * 성공 응답 (데이터 포함)
     */
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .build();
    }

    /**
     * 성공 응답 (데이터 없음)
     */
    public static <T> ApiResponse<T> success() {
        return ApiResponse.<T>builder()
                .success(true)
                .build();
    }

    /**
     * 실패 응답
     */
    public static <T> ApiResponse<T> error(String code, int status, String message, String detail) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(new ErrorInfo(code, status, message, detail, java.time.LocalDateTime.now().toString(), java.util.Collections.emptyList()))
                .build();
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorInfo {
        private String code;
        private int status;
        private String message;
        private String detail;
        private String timestamp;
        private java.util.List<Object> errors;
    }
}
