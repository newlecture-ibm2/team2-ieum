package com.ieum.global.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger (OpenAPI 3.0) 설정
 *
 * - JWT Bearer 인증 스키마 등록
 * - User API / Admin API 그룹 분리
 *
 * 접속: http://localhost:8080/swagger-ui.html
 */
@Configuration
public class SwaggerConfig {

    private static final String SECURITY_SCHEME_NAME = "Bearer Authentication";

    // ─────────────────────────────────────────────
    // 1) OpenAPI 기본 정보 + JWT 인증 스키마
    // ─────────────────────────────────────────────
    @Bean
    public OpenAPI openAPI() {
        SecurityScheme securityScheme = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("JWT 토큰을 입력하세요. (Bearer 접두사 불필요)");

        SecurityRequirement securityRequirement =
                new SecurityRequirement().addList(SECURITY_SCHEME_NAME);

        return new OpenAPI()
                .info(apiInfo())
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME, securityScheme))
                .addSecurityItem(securityRequirement);
    }

    private Info apiInfo() {
        return new Info()
                .title("이음(IEUM) Festival API")
                .description("""
                    전국 축제 통합 정보 플랫폼 API 명세서

                    ## 인증 방식
                    - `POST /api/auth/login` 으로 로그인 후 받은 `accessToken`을
                      우측 상단 🔓 **Authorize** 버튼에 입력하세요.

                    ## API 그룹
                    - **User API** — 일반 사용자용 (축제 조회, 리뷰, 커뮤니티 등)
                    - **Admin API** — 관리자 전용 (축제 관리, 통계, 신고 처리 등)
                    """)
                .version("v1.0.0")
                .contact(new Contact()
                        .name("이음 팀")
                        .email("team@ieum.com"));
    }

    // ─────────────────────────────────────────────
    // 2) User API 그룹 (/api/** , /api/admin/** 제외)
    // ─────────────────────────────────────────────
    @Bean
    public GroupedOpenApi userApi() {
        return GroupedOpenApi.builder()
                .group("1. User API")
                .pathsToMatch("/api/**")
                .pathsToExclude("/api/admin/**")
                .build();
    }

    // ─────────────────────────────────────────────
    // 3) Admin API 그룹 (/api/admin/**)
    // ─────────────────────────────────────────────
    @Bean
    public GroupedOpenApi adminApi() {
        return GroupedOpenApi.builder()
                .group("2. Admin API")
                .pathsToMatch("/api/admin/**")
                .build();
    }
}
