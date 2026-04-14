package com.ieum.global.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.io.FileNotFoundException;
import java.util.HashMap;
import java.util.Map;

/**
 * [전역 예외 처리기]
 * 모든 컨트롤러에서 발생한 예외를 잡아서, 500 에러 대신 깔끔한 JSON 응답으로 변환합니다.
 * 별도 try-catch 없이도 서비스에서 throw만 하면 이 핸들러가 자동으로 처리합니다.
 */
@Slf4j
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

    /**
     * 비즈니스 로직 예외 처리 (아이디 중복 등)
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("errorType", "IllegalArgumentException");
        errorResponse.put("errorMessage", ex.getMessage());

        // 메시지에 "이미 사용 중인"이 포함된 경우 409(Conflict), 그 외는 400(Bad Request)
        int status = 400;
        if (ex.getMessage() != null && ex.getMessage().contains("이미 사용 중인")) {
            status = 409;
        }
        
        return ResponseEntity.status(status).body(errorResponse);
    }

    /**
     * ✅ 정적 리소스(이미지 등)를 찾을 수 없는 경우 (Spring Boot 3.2+)
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, String>> handleNoResourceFoundException(NoResourceFoundException ex) {
        log.warn(">>> [Resource Not Found] RequestPath: {}, Message: {}", ex.getResourcePath(), ex.getMessage());
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("errorCode", "FILE_001");
        errorResponse.put("errorMessage", "요청하신 파일을 찾을 수 없습니다.");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    /**
     * ✅ 파일 시스템에서 파일을 찾을 수 없는 경우
     */
    @ExceptionHandler(FileNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleFileNotFoundException(FileNotFoundException ex) {
        log.warn(">>> [File Not Found] Message: {}", ex.getMessage());
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("errorCode", "FILE_001");
        errorResponse.put("errorMessage", "서버 디스크에 해당 파일이 존재하지 않습니다.");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
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
