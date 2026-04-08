# 📘 Swagger(OpenAPI 3.0) 설정 청사진

> **목적**: 팀원 간 API 명세 공유 & 실시간 테스트 환경 구축  
> **작성일**: 2026년 3월 26일  
> **기술 스택**: Spring Boot 3.5.6 + springdoc-openapi 2.8.9

---

## 📋 목차

1. [현재 상태 확인](#1-현재-상태-확인)
2. [SwaggerConfig 작성](#2-swaggerconfig-작성)
3. [Spring Security 연동](#3-spring-security-연동)
4. [application.yml 추가 설정](#4-applicationyml-추가-설정)
5. [Controller에 API 문서화 어노테이션 적용](#5-controller에-api-문서화-어노테이션-적용)
6. [DTO에 스키마 어노테이션 적용](#6-dto에-스키마-어노테이션-적용)
7. [접속 방법 & 팀 공유 가이드](#7-접속-방법--팀-공유-가이드)
8. [자주 쓰는 어노테이션 치트시트](#8-자주-쓰는-어노테이션-치트시트)
9. [동적/자유 구조 응답 (Map 등) 문서화 가이드](#9-동적자유-구조-응답-map-등-문서화-가이드)

---

## 1. 현재 상태 확인

### ✅ 이미 완료된 것

| 항목 | 상태 | 위치 |
|------|------|------|
| springdoc-openapi 의존성 | ✅ 추가됨 | `build.gradle` 33번 줄 |
| swagger-ui 경로 설정 | ✅ 설정됨 | `application.yml` 29~35번 줄 |
| SwaggerConfig.java | ❌ **미작성** | `global/config/` (빈 폴더) |
| SecurityConfig에서 Swagger 경로 허용 | ❌ **미설정** | `global/security/` (빈 폴더) |

### ❌ 해야 할 것

1. `SwaggerConfig.java` 작성 (API 그룹 분리 + JWT 인증 헤더 설정)
2. `SecurityConfig.java`에서 Swagger 관련 URL 허용
3. Controller / DTO에 문서화 어노테이션 적용

---

## 2. SwaggerConfig 작성

### 파일 경로
```
backend/src/main/java/com/ieum/festival/global/config/SwaggerConfig.java
```

### 코드

```java
package com.ieum.festival.global.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    // ─────────────────────────────────────────────
    // 1) OpenAPI 기본 정보 + JWT 인증 스키마
    // ─────────────────────────────────────────────
    @Bean
    public OpenAPI openAPI() {
        // JWT Bearer 인증 스키마 정의
        String securitySchemeName = "Bearer Authentication";

        SecurityScheme securityScheme = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("JWT 토큰을 입력하세요. (Bearer 접두사 불필요)");

        SecurityRequirement securityRequirement =
                new SecurityRequirement().addList(securitySchemeName);

        return new OpenAPI()
                .info(apiInfo())
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName, securityScheme))
                .addSecurityItem(securityRequirement);
    }

    private Info apiInfo() {
        return new Info()
                .title("이음(IEUM) Festival API")
                .description("""
                    전국 축제 통합 정보 플랫폼 API 명세서
                    
                    ## 인증 방식
                    - POST /api/auth/login 으로 로그인 후 받은 accessToken을
                      우측 상단 Authorize 버튼에 입력하세요.
                    
                    ## API 그룹
                    - **User API**: 일반 사용자용 (축제 조회, 리뷰, 커뮤니티 등)
                    - **Admin API**: 관리자 전용 (축제 관리, 통계, 신고 처리 등)
                    """)
                .version("v1.0.0")
                .contact(new Contact()
                        .name("이음 팀")
                        .email("team@ieum.com"));
    }

    // ─────────────────────────────────────────────
    // 2) User API 그룹 (/api/**)
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
```

> **핵심 포인트**: `GroupedOpenApi`를 사용하면 Swagger UI 상단 드롭다운에서 User/Admin API를 분리해서 볼 수 있습니다. 프론트엔드 팀원은 User API만, 관리자 기능 담당자는 Admin API만 보면 되어 효율적입니다.

---

## 3. Spring Security 연동

### 파일 경로
```
backend/src/main/java/com/ieum/festival/global/security/SecurityConfig.java
```

### Swagger 경로 허용 설정

SecurityConfig에서 아래 경로들을 `permitAll()` 처리해야 Swagger UI에 접근할 수 있습니다.

```java
package com.ieum.festival.global.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Swagger UI 관련 허용 경로 목록
    private static final String[] SWAGGER_WHITELIST = {
        "/swagger-ui/**",
        "/swagger-ui.html",
        "/v3/api-docs/**",
        "/v3/api-docs.yaml"
    };

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // ✅ Swagger UI 허용
                .requestMatchers(SWAGGER_WHITELIST).permitAll()

                // 인증 API 허용
                .requestMatchers("/api/auth/**").permitAll()

                // 축제/공지/커뮤니티 조회는 비회원도 허용
                .requestMatchers("GET", "/api/festivals/**").permitAll()
                .requestMatchers("GET", "/api/notices/**").permitAll()
                .requestMatchers("GET", "/api/community/**").permitAll()

                // 관리자 전용
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // 나머지는 인증 필요
                .anyRequest().authenticated()
            );

        // TODO: JWT 필터 추가
        // .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

> **⚠️ 주의**: 운영 환경(Production)에서는 Swagger 접근을 제한해야 합니다. 프로필별로 분리하는 방법은 아래 4번 섹션을 참고하세요.

---

## 4. application.yml 추가 설정

현재 `application.yml`에 기본 설정이 있지만, 아래 항목을 추가하면 더 편리합니다.

```yaml
# Swagger 설정 (기존 내용 교체/보강)
springdoc:
  swagger-ui:
    path: /swagger-ui.html
    groups-order: DESC
    tags-sorter: alpha              # 태그 알파벳 정렬
    operations-sorter: method       # HTTP 메서드별 정렬 (GET→POST→PUT→DELETE)
    doc-expansion: none             # 기본 접힘 상태 (none | list | full)
    default-models-expand-depth: 2  # 모델 스키마 펼침 깊이
  api-docs:
    path: /v3/api-docs
  default-consumes-media-type: application/json
  default-produces-media-type: application/json
```

### 프로필별 Swagger ON/OFF (운영 환경 보안)

```yaml
# application-dev.yml (개발용) — Swagger 활성화
springdoc:
  api-docs:
    enabled: true

---
# application-prod.yml (운영용) — Swagger 비활성화
springdoc:
  api-docs:
    enabled: false
  swagger-ui:
    enabled: false
```

---

## 5. Controller에 API 문서화 어노테이션 적용

### 예시: FestivalController

```java
package com.ieum.festival.user.festival.adapter.in.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "축제", description = "축제 조회 관련 API")
@RestController
@RequestMapping("/api/festivals")
public class FestivalController {

    @Operation(
        summary = "축제 목록 조회",
        description = "진행 중인 축제 목록을 페이지네이션으로 조회합니다. 비회원도 이용 가능합니다."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 파라미터")
    })
    @GetMapping
    public String getFestivals(
            @Parameter(description = "페이지 번호 (0부터 시작)", example = "0")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "페이지 크기", example = "10")
            @RequestParam(defaultValue = "10") int size,

            @Parameter(description = "지역 필터 (시/도)", example = "서울특별시")
            @RequestParam(required = false) String region
    ) {
        // TODO: 구현
        return "축제 목록";
    }

    @Operation(summary = "축제 상세 조회", description = "축제 ID로 상세 정보를 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "축제를 찾을 수 없음")
    })
    @GetMapping("/{id}")
    public String getFestivalDetail(
            @Parameter(description = "축제 ID", required = true, example = "1")
            @PathVariable Long id
    ) {
        // TODO: 구현
        return "축제 상세";
    }
}
```

### 예시: AuthController (JWT 로그인)

```java
@Tag(name = "인증", description = "로그인/회원가입 API")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Operation(
        summary = "로그인",
        description = "이메일/비밀번호로 로그인 후 JWT 토큰을 발급합니다."
    )
    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {
        // TODO: 구현
        return "로그인 성공";
    }
}
```

---

## 6. DTO에 스키마 어노테이션 적용

### 예시: Request DTO

```java
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "로그인 요청")
public record LoginRequest(
    @Schema(description = "이메일", example = "user@ieum.com", requiredMode = Schema.RequiredMode.REQUIRED)
    String email,

    @Schema(description = "비밀번호", example = "password123", requiredMode = Schema.RequiredMode.REQUIRED)
    String password
) {}
```

### 예시: Response DTO

```java
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "축제 목록 응답")
public record FestivalResponse(
    @Schema(description = "축제 ID", example = "1")
    Long id,

    @Schema(description = "축제명", example = "진해 군항제")
    String title,

    @Schema(description = "축제 상태", example = "ONGOING", allowableValues = {"UPCOMING", "ONGOING", "ENDED"})
    String status,

    @Schema(description = "시작일", example = "2026-04-01")
    String startDate,

    @Schema(description = "종료일", example = "2026-04-10")
    String endDate,

    @Schema(description = "개최 지역", example = "경상남도 창원시")
    String region
) {}
```

---

## 7. 접속 방법 & 팀 공유 가이드

### 로컬 접속

| 항목 | URL |
|------|-----|
| **Swagger UI** | http://localhost:8080/swagger-ui.html |
| **API 문서 (JSON)** | http://localhost:8080/v3/api-docs |
| **API 문서 (YAML)** | http://localhost:8080/v3/api-docs.yaml |

### JWT 인증 테스트 방법

```
1. Swagger UI 접속
2. "1. User API" 그룹 선택
3. POST /api/auth/login 실행 → accessToken 복사
4. 우측 상단 🔓 [Authorize] 버튼 클릭
5. Value에 토큰 붙여넣기 (Bearer 접두사 없이)
6. 인증 필요 API 테스트 가능!
```

### 팀원 공유 팁

- **같은 네트워크**라면 `http://{본인IP}:8080/swagger-ui.html`로 공유 가능
- **API 문서 export**: `/v3/api-docs.yaml` 접속 후 저장하면 Postman에 import 가능
- **Docker 사용 시**: `docker-compose up` 후 동일 URL로 접속

---

## 8. 자주 쓰는 어노테이션 치트시트

### Controller 레벨

| 어노테이션 | 용도 | 예시 |
|-----------|------|------|
| `@Tag` | API 그룹 태그 지정 | `@Tag(name = "축제", description = "축제 API")` |
| `@Operation` | 개별 API 설명 | `@Operation(summary = "목록 조회")` |
| `@ApiResponses` | 응답 코드별 설명 | `@ApiResponse(responseCode = "200")` |
| `@Parameter` | 파라미터 설명 | `@Parameter(description = "축제 ID")` |
| `@Hidden` | Swagger에서 숨김 | `@Hidden` (메서드 또는 클래스에) |

### DTO / Model 레벨

| 어노테이션 | 용도 | 예시 |
|-----------|------|------|
| `@Schema` | 필드/클래스 설명 | `@Schema(description = "이메일", example = "a@b.com")` |
| `@Schema(hidden)` | 필드 숨김 | `@Schema(hidden = true)` |
| `@Schema(allowableValues)` | enum 값 표시 | `@Schema(allowableValues = {"A", "B"})` |

### 파일 업로드

```java
@Operation(summary = "리뷰 사진 업로드")
@PostMapping(value = "/upload", consumes = "multipart/form-data")
public String upload(
    @Parameter(description = "이미지 파일")
    @RequestParam("file") MultipartFile file
) { ... }
```

---

## 9. 동적/자유 구조 응답 (Map 등) 문서화 가이드

프론트엔드에 `FestivalResponse` 같은 정적 DTO가 아닌, 공공데이터(TourAPI) 등을 조합하여 `Map<String, Object>` 형태로 유연하게 응답을 내려보낼 경우 Swagger가 내부 필드(`overview`, `tel` 등)를 자동 추론하지 못합니다. 

이 경우 방금 축제 상세 조회 API에 적용한 것처럼, `@Operation`의 `description` 항목에 마크다운 문법을 활용하여 응답 항목들을 명확히 나열해 주어야 합니다.

### 예시: FestivalController 공공데이터 응답 문서화

```java
@Operation(
    summary = "축제 상세 조회", 
    description = "축제 ID로 상세 정보를 조회합니다.\\n\\n" +
                  "**[공공데이터 연동 상세 항목 (TourAPI)]**\\n" +
                  "- `overview` (개요): 축제에 대한 상세 설명\\n" +
                  "- `tel` (전화번호): 행사 문의 번호\\n" +
                  "- `useFee` (이용요금): 티켓 가격 정보\\n" +
                  "- `extraImages`: 축제 전경 추가 이미지 배열"
)
@GetMapping("/{festivalId}")
public ResponseEntity<?> getFestivalDetail(@PathVariable Long festivalId) {
    Map<String, Object> detail = loadFestivalDetailUseCase.loadDetail(festivalId);
    return ResponseEntity.ok(Map.of("success", true, "data", detail));
}
```

> **규칙**: DTO 파일 생성이 애매한 자유 구조 응답(`Map` 등)을 반환할 때는 반드시 위와 같이 `@Operation(description="...")` 영역에 Key와 목적을 프론트엔드가 이해할 수 있도록 마크다운으로 문서화합니다.

---

## 📁 최종 파일 구조

```
backend/src/main/java/com/ieum/festival/global/
├── config/
│   └── SwaggerConfig.java          ← ✨ 새로 생성
├── security/
│   └── SecurityConfig.java         ← ✨ 새로 생성 (Swagger 경로 허용 포함)
├── exception/
├── init/
│   └── DataInitializer.java
└── response/
```

---

## ✅ 작업 체크리스트

- [ ] `SwaggerConfig.java` 생성 (`global/config/`)
- [ ] `SecurityConfig.java`에서 Swagger 경로 `permitAll()` 추가
- [ ] `application.yml` 정렬/펼침 옵션 보강
- [ ] Controller에 `@Tag`, `@Operation` 어노테이션 적용
- [ ] Request/Response DTO에 `@Schema` 어노테이션 적용
- [ ] `http://localhost:8080/swagger-ui.html` 접속 확인
- [ ] JWT 인증 테스트 확인
