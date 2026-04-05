package com.ieum.admin.festival.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * master_sigungu 테이블 PK 구조 마이그레이션
 * - 기존: sigungu_code 단일 PK → 지역 간 코드 충돌 발생
 * - 변경: (region_code, sigungu_code) 복합 PK
 * - 서버 기동 시 자동으로 기존 테이블 drop → 복합 PK로 재생성
 */
@Slf4j
@Component
@Order(0) // 모든 다른 Runner보다 먼저 실행
@RequiredArgsConstructor
public class SigunguTableMigrationRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            // 기존 테이블의 PK 컬럼 수 확인
            Integer pkCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.key_column_usage kcu " +
                "JOIN information_schema.table_constraints tc " +
                "ON kcu.constraint_name = tc.constraint_name " +
                "WHERE tc.table_name = 'master_sigungu' AND tc.constraint_type = 'PRIMARY KEY'",
                Integer.class);

            if (pkCount != null && pkCount < 2) {
                log.info("========== master_sigungu PK 마이그레이션: 단일 PK({})개 → 복합 PK ==========", pkCount);
                jdbcTemplate.execute("DROP TABLE IF EXISTS master_sigungu CASCADE");
                jdbcTemplate.execute(
                    "CREATE TABLE master_sigungu (" +
                    "  region_code VARCHAR(10) NOT NULL, " +
                    "  sigungu_code VARCHAR(10) NOT NULL, " +
                    "  name VARCHAR(50) NOT NULL, " +
                    "  is_active BOOLEAN NOT NULL DEFAULT TRUE, " +
                    "  PRIMARY KEY (region_code, sigungu_code)" +
                    ")"
                );
                log.info("master_sigungu 테이블 복합 PK로 재생성 완료");
            } else {
                log.info("master_sigungu PK 구조 정상 (복합 PK {}) — 마이그레이션 불필요", pkCount);
            }
        } catch (Exception e) {
            // 테이블이 존재하지 않는 경우 — 신규 생성 (Hibernate가 처리)
            log.info("master_sigungu 확인 중 예외 — Hibernate가 신규 생성합니다: {}", e.getMessage());
            try {
                jdbcTemplate.execute("DROP TABLE IF EXISTS master_sigungu CASCADE");
                jdbcTemplate.execute(
                    "CREATE TABLE master_sigungu (" +
                    "  region_code VARCHAR(10) NOT NULL, " +
                    "  sigungu_code VARCHAR(10) NOT NULL, " +
                    "  name VARCHAR(50) NOT NULL, " +
                    "  is_active BOOLEAN NOT NULL DEFAULT TRUE, " +
                    "  PRIMARY KEY (region_code, sigungu_code)" +
                    ")"
                );
                log.info("master_sigungu 테이블 복합 PK로 신규 생성 완료");
            } catch (Exception ex) {
                log.error("master_sigungu 테이블 생성 실패: {}", ex.getMessage());
            }
        }
    }
}
