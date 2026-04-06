package com.ieum.global.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Spring Security 설정
 *
 * - Swagger UI 경로 permitAll
 * - 공개 API (축제 조회, 인증) permitAll
 * - 관리자 로그인 permitAll
 * - 회원 전용 API hasRole("USER")
 * - 관리자 API hasRole("ADMIN")
 * - 나머지 인증 필요
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

        /**
         * Swagger UI 관련 허용 경로 목록
         */
        private static final String[] SWAGGER_WHITELIST = {
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/v3/api-docs/**",
                        "/v3/api-docs.yaml"
        };

        @Bean
        public SecurityFilterChain filterChain(
                        HttpSecurity http,
                        JwtAuthenticationFilter jwtAuthenticationFilter,
                        JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
                        JwtAccessDeniedHandler jwtAccessDeniedHandler) throws Exception {
                http
                                // CSRF 비활성화 (REST API는 Stateless)
                                .csrf(csrf -> csrf.disable())

                                // CORS 설정 활성화 (WebConfig의 CorsConfigurationSource 사용)
                                .cors(cors -> {
                                })

                                // 세션 사용하지 않음 (JWT 기반)
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                // URL별 권한 설정
                                .authorizeHttpRequests(auth -> auth
                                                // ✅ Swagger UI 허용
                                                .requestMatchers(SWAGGER_WHITELIST).permitAll()

                                                // ✅ 인증 API 허용 (회원가입, 로그인)
                                                .requestMatchers(HttpMethod.POST, "/api/auth/**").permitAll()

                                                // ✅ 축제 조회 — 비회원 허용
                                                .requestMatchers(HttpMethod.GET, "/api/festivals/**").permitAll()
                                                .requestMatchers(HttpMethod.POST, "/api/festivals/sync").permitAll() // ✅
                                                                                                                     // 공공데이터
                                                                                                                     // 수동
                                                                                                                     // 동기화
                                                                                                                     // 허용
                                                .requestMatchers(HttpMethod.PATCH, "/api/festivals/refresh-status")
                                                .permitAll() // ✅ 축제 상태 갱신 허용

                                                // ✅ 리뷰 조회 — 비회원 허용
                                                .requestMatchers(HttpMethod.GET, "/api/reviews").permitAll()

                                                // ✅ 커뮤니티 조회 — 비회원 허용
                                                .requestMatchers(HttpMethod.GET, "/api/community/**").permitAll()

                                                // ✅ 공지사항 조회 — 비회원 허용
                                                .requestMatchers(HttpMethod.GET, "/api/notices/**").permitAll()

                                                // 🔒 회원 전용 — 프로필, 알림, FCM
                                                .requestMatchers("/api/users/me/**").hasRole("USER")

                                                // 🔒 회원 전용 — 리뷰 CUD
                                                .requestMatchers(HttpMethod.POST, "/api/reviews").hasRole("USER")
                                                .requestMatchers(HttpMethod.PUT, "/api/reviews/**").hasRole("USER")
                                                .requestMatchers(HttpMethod.DELETE, "/api/reviews/**").hasRole("USER")

                                                // 🔒 회원 전용 — 즐겨찾기
                                                .requestMatchers("/api/favorites/**").hasRole("USER")

                                                // 🔒 회원 전용 — 커뮤니티 CUD
                                                .requestMatchers(HttpMethod.POST, "/api/community/**").hasRole("USER")
                                                .requestMatchers(HttpMethod.PUT, "/api/community/**").hasRole("USER")
                                                .requestMatchers(HttpMethod.DELETE, "/api/community/**").hasRole("USER")

                                                // 🔒 회원 전용 — 신고
                                                .requestMatchers(HttpMethod.POST, "/api/reports").hasRole("USER")

                                                // ✅ 관리자 로그인 — 인증 불필요
                                                .requestMatchers(HttpMethod.POST, "/api/admin/auth/login").permitAll()

                                                // ✅ 달력(캘린더) 조회 — 비회원 허용
                                                .requestMatchers(HttpMethod.GET, "/api/calendar/**").permitAll()

                                                // ✅ 첨부파일(이미지 등) 다운로드 허용
                                                // [로컬 개발 환경 전용 설정] 실서버에서는 Nginx가 처리하므로 이 필터를 거치지 않습니다.
                                                .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()

                                                // ✅ 에러 페이지 경로 허용 (404 등이 401로 마스킹되는 것 방지)
                                                .requestMatchers("/error").permitAll()

                                                // ✅ 관리자 인증 API (Refresh 등)
                                                .requestMatchers("/api/admin/auth/**").permitAll()

                                                // 🔐 관리자 전용 (모든 관리자 API 일괄 적용)
                                                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                                                // 🔒 그 외 인증 필요
                                                .anyRequest().authenticated())

                                // 🚨 예외 처리 핸들러 (401, 403)
                                .exceptionHandling(exception -> exception
                                                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                                                .accessDeniedHandler(jwtAccessDeniedHandler))

                                // JWT 필터 추가
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }
}
