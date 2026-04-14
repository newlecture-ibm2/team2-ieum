package com.ieum.global.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * [전역 예외 처리기]
 * 모든 컨트롤러에서 발생한 예외를 잡아서, 500 에러 대신 깔끔한 JSON 응답으로 변환합니다.
 * 별도 try-catch 없이도 서비스에서 throw만 하면 이 핸들러가 자동으로 처리합니다.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * @Valid 검증 예외 처리 (400 Bad Request)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("errorType", "ValidationException");
        errorResponse.put("errorMessage", message);
        
        return ResponseEntity.status(400).body(errorResponse);
    }

    /**
     * 로그인 실패 예외 처리 (401 Unauthorized)
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleBadCredentialsException(BadCredentialsException ex) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("errorType", "BadCredentialsException");
        errorResponse.put("errorMessage", ex.getMessage());
        
        return ResponseEntity.status(401).body(errorResponse);
    }

    /**
     * 커스텀 비즈니스 예외 처리
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Map<String, String>> handleBusinessException(BusinessException ex) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("errorType", ex.getErrorCode().name());
        errorResponse.put("errorMessage", ex.getMessage());
        
        return ResponseEntity.status(ex.getErrorCode().getStatus()).body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAllExceptions(Exception ex) {
        ex.printStackTrace(); // 콘솔에 상세 로그 출력
        
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("errorType", ex.getClass().getSimpleName());
        errorResponse.put("errorMessage", ex.getMessage());
        
        // 스택 트레이스의 첫 줄을 포함
        if (ex.getStackTrace() != null && ex.getStackTrace().length > 0) {
            errorResponse.put("errorLocation", ex.getStackTrace()[0].toString());
        }
        
        return ResponseEntity.status(500).body(errorResponse);
    }
}
