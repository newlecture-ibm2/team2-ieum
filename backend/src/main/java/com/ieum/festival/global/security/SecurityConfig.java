package com.ieum.festival.global.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security 설정
 *
 * - Swagger UI 경로 permitAll
 * - 공개 API (축제 조회, 인증) permitAll
 * - 관리자 API ADMIN 역할 필요
 * - 나머지 인증 필요
 *
 * TODO: JWT 필터 완성 후 addFilterBefore() 추가
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
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // CSRF 비활성화 (REST API는 Stateless)
                .csrf(csrf -> csrf.disable())

                // CORS 설정 활성화 (WebConfig의 CorsConfigurationSource 사용)
                .cors(cors -> {})

                // 세션 사용하지 않음 (JWT 기반)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // URL별 권한 설정
                .authorizeHttpRequests(auth -> auth
                        // ✅ Swagger UI 허용
                        .requestMatchers(SWAGGER_WHITELIST).permitAll()

                        // ✅ 인증 API 허용
                        .requestMatchers("/api/auth/**").permitAll()

                        // ✅ 축제/공지/커뮤니티 조회는 비회원도 허용
                        .requestMatchers("GET", "/api/festivals/**").permitAll()
                        .requestMatchers("GET", "/api/notices/**").permitAll()
                        .requestMatchers("GET", "/api/community/**").permitAll()

                        // 🔒 관리자 전용
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // 🔒 나머지는 인증 필요
                        .anyRequest().authenticated()
                );

        // TODO: JWT 필터 추가
        // .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
