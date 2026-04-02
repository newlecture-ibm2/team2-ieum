package com.ieum.global.exception;

import com.ieum.global.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpClientErrorException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException e) {
        log.error("BusinessException: ", e);
        return ResponseEntity.status(e.getErrorCode().getStatus()).body(
            ApiResponse.error(e.getErrorCode().getCode(), e.getErrorCode().getStatus().value(), e.getErrorCode().getMessage(), e.getDetail())
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        log.error("Unhandled Exception: ", e);
        
        // TourAPI 등 외부 연동 관련 403 / 401 오류 처리용 (RestTemplate Exception 처리)
        if (e.getCause() instanceof HttpClientErrorException) {
            HttpClientErrorException httpEx = (HttpClientErrorException) e.getCause();
            if (httpEx.getStatusCode() == HttpStatus.FORBIDDEN || httpEx.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResponse.error("COMMON_500", 500, "외부 공개 API 인증/권한 실패. API Key를 확인하세요.", httpEx.getMessage())
                );
            }
        }
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
            ApiResponse.error("COMMON_500", 500, "서버 내부 오류가 발생했습니다.", e.getMessage())
        );
    }
}
