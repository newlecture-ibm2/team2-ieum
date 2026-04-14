package com.ieum.global.exception;

import com.ieum.global.response.ApiResponse;
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
     * 커스텀 비즈니스 예외 처리 (ErrorCode 기반)
     * - NoticeAdminService, PostService, CommentService, ReportService 등에서 throw
     * - ErrorCode에 정의된 HttpStatus + 메시지로 ApiResponse.error() 형태 응답
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<?>> handleBusinessException(BusinessException ex) {
        ErrorCode ec = ex.getErrorCode();
        return ResponseEntity.status(ec.getStatus())
                .body(ApiResponse.error(ApiResponse.ErrorResponse.of(
                        ec.name(),
                        ec.getStatus().value(),
                        ec.getMessage(),
                        ex.getDetail()
                )));
    }

    /**
     * @Valid 검증 예외 처리 (400 Bad Request)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        return ResponseEntity.status(400)
                .body(ApiResponse.error(ApiResponse.ErrorResponse.of("ValidationException", 400, message, null)));
    }

    /**
     * 로그인 실패 예외 처리 (401 Unauthorized)
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<?>> handleBadCredentialsException(BadCredentialsException ex) {
        return ResponseEntity.status(401)
                .body(ApiResponse.error(ApiResponse.ErrorResponse.of("BadCredentialsException", 401, ex.getMessage(), null)));
    }

    /**
     * 권한 없음 (403 Forbidden) 및 인증 실패 (401 Unauthorized) 예외 처리
     * Spring Security에서 발생하는 AccessDeniedException이 Exception.class로 빠져서 500이 되는 것을 방지
     */
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handleAccessDeniedException(org.springframework.security.access.AccessDeniedException ex) {
        return ResponseEntity.status(403)
                .body(ApiResponse.error(ApiResponse.ErrorResponse.of("AccessDeniedException", 403, "접근 권한이 없습니다.", null)));
    }

    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public ResponseEntity<ApiResponse<?>> handleAuthenticationException(org.springframework.security.core.AuthenticationException ex) {
        return ResponseEntity.status(401)
                .body(ApiResponse.error(ApiResponse.ErrorResponse.of("Unauthorized", 401, "인증이 거부되었습니다.", null)));
    }

    /**
     * 비즈니스 로직 예외 처리 (아이디 중복 등)
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<?>> handleIllegalArgumentException(IllegalArgumentException ex) {
        int status = ex.getMessage() != null && ex.getMessage().contains("이미 사용 중인") ? 409 : 400;
        return ResponseEntity.status(status)
                .body(ApiResponse.error(ApiResponse.ErrorResponse.of("IllegalArgumentException", status, ex.getMessage(), null)));
    }

    /**
     * ✅ 정적 리소스(이미지 등)를 찾을 수 없는 경우 (Spring Boot 3.2+)
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleNoResourceFoundException(NoResourceFoundException ex) {
        log.warn(">>> [Resource Not Found] RequestPath: {}, Message: {}", ex.getResourcePath(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ApiResponse.ErrorResponse.of("FILE_001", HttpStatus.NOT_FOUND.value(), "요청하신 파일을 찾을 수 없습니다.", null)));
    }

    /**
     * ✅ 파일 시스템에서 파일을 찾을 수 없는 경우
     */
    @ExceptionHandler(FileNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleFileNotFoundException(FileNotFoundException ex) {
        log.warn(">>> [File Not Found] Message: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ApiResponse.ErrorResponse.of("FILE_001", HttpStatus.NOT_FOUND.value(), "서버 디스크에 해당 파일이 존재하지 않습니다.", null)));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleAllExceptions(Exception ex) {
        log.error("Unhandled Exception Caught: ", ex); // 운영 환경에 남도록 slf4j 로거로 전환
        String location = ex.getStackTrace() != null && ex.getStackTrace().length > 0 ? ex.getStackTrace()[0].toString() : null;
        return ResponseEntity.status(500)
                .body(ApiResponse.error(ApiResponse.ErrorResponse.of(ex.getClass().getSimpleName(), 500, ex.getMessage(), location)));
    }
}
