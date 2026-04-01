package com.ieum.global.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ieum.global.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * 인증되지 않은 사용자(토큰 누락, 만료 등)가 API에 접근하려 할 때 잡아서 401 JSON을 뱉는 핸들러
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException {
        log.warn("인증 실패 (401): {}", authException.getMessage());

        ApiResponse.ErrorResponse errorResponse = ApiResponse.ErrorResponse.of(
                "AUTH_001",
                HttpStatus.UNAUTHORIZED.value(),
                "로그인이 필요한 서비스입니다.",
                authException.getMessage()
        );

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());

        String json = objectMapper.writeValueAsString(ApiResponse.error(errorResponse));
        response.getWriter().write(json);
    }
}
