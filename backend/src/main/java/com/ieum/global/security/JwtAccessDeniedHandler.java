package com.ieum.global.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ieum.global.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * 권한이 부족한 사용자(예: 일반 유저가 관리자 API 접근)가 접근하려 할 때 잡아서 403 JSON을 뱉는 핸들러
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException {
        log.warn("인가 실패 (403): {}", accessDeniedException.getMessage());

        ApiResponse.ErrorResponse errorResponse = ApiResponse.ErrorResponse.of(
                "AUTH_003",
                HttpStatus.FORBIDDEN.value(),
                "해당 기능에 대한 접근 권한이 없습니다.",
                accessDeniedException.getMessage()
        );

        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());

        String json = objectMapper.writeValueAsString(ApiResponse.error(errorResponse));
        response.getWriter().write(json);
    }
}
