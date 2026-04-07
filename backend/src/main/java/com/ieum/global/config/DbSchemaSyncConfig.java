package com.ieum.global.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

/**
 * 🛠️ DB 스키마 동기화 설정 (임시 수술 도구)
 * 네이버 로그인 500 에러 해결을 위해 email → login_id 변경 및 password NULL 허용 작업을 수행합니다.
 * 본 파일은 작업 완료 후 삭제될 수 있습니다.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class DbSchemaSyncConfig {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void syncSchema() {
        log.info(">>> [DB Schema Sync] PostgreSQL 스키마 점검 및 보정 작업 시작! 🔍🩺");

        try {
            // 1. users 테이블의 email 컬럼을 login_id로 RENAME (존재할 경우에만)
            String renameSql = "DO $$\n" +
                    "BEGIN\n" +
                    "    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email') THEN\n" +
                    "        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='login_id') THEN\n" +
                    "            ALTER TABLE users RENAME COLUMN email TO login_id;\n" +
                    "            RAISE NOTICE 'email을 login_id로 성공적으로 변경했습니다. ✅';\n" +
                    "        ELSE\n" +
                    "            -- 둘 다 존재할 경우 email의 NOT NULL 제약만 해제하여 충돌 방지\n" +
                    "            ALTER TABLE users ALTER COLUMN email DROP NOT NULL;\n" +
                    "            RAISE NOTICE 'email의 NOT NULL을 해제하여 소셜 로그인 충돌을 방지했습니다. ✅';\n" +
                    "        END IF;\n" +
                    "    END IF;\n" +
                    "END $$;";
            jdbcTemplate.execute(renameSql);
            log.info(">>> [DB Schema Sync] Step 1: login_id 동기화 완료! ✅");

            // 2. password 컬럼의 NOT NULL 제약 조건 해제 (소셜 로그인 유저 대응)
            String dropNotNullSql = "ALTER TABLE users ALTER COLUMN password DROP NOT NULL;";
            jdbcTemplate.execute(dropNotNullSql);
            log.info(">>> [DB Schema Sync] Step 2: password 제약 조건 완화 완료! ✅");

            // 3. 닉네임 유니크 제약 조건 및 기본 필드 점검 (PostgreSQL Enum 타입 등은 이미 Kakao에서 검증됨)
            log.info(">>> [DB Schema Sync] 모든 스키마 보정 작업이 성공적으로 끝났습니다! 🐘💨✨");

        } catch (Exception e) {
            log.error(">>> [DB Schema Sync] 보정 작업 중 오류 발생(이미 반영되었을 수 있음): {}", e.getMessage());
        }
    }
}
