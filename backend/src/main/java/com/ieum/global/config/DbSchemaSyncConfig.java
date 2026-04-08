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
            // 1. users 테이블의 email 컬럼을 login_id로 RENAME 또는 제거
            String syncLoginIdSql = "DO $$\n" +
                    "BEGIN\n" +
                    "    -- 1-1. email이 있고 login_id가 없으면 RENAME\n" +
                    "    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email') AND \n" +
                    "       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='login_id') THEN\n" +
                    "        ALTER TABLE users RENAME COLUMN email TO login_id;\n" +
                    "        RAISE NOTICE 'email을 login_id로 성공적으로 변경했습니다. ✅';\n" +
                    "    \n" +
                    "    -- 1-2. 둘 다 존재하면 email을 삭제 (중복 방지)\n" +
                    "    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email') AND \n" +
                    "          EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='login_id') THEN\n" +
                    "        ALTER TABLE users DROP COLUMN email;\n" +
                    "        RAISE NOTICE '중복된 email 컬럼을 제거했습니다. ✅';\n" +
                    "    END IF;\n" +
                    "END $$;";
            jdbcTemplate.execute(syncLoginIdSql);
            log.info(">>> [DB Schema Sync] Step 1: login_id 동기화 및 email 제거 완료! ✅");

            // 2. password 컬럼의 NOT NULL 제약 조건 해제 (소셜 로그인 유저 대응)
            String dropPasswordNotNullSql = "ALTER TABLE users ALTER COLUMN password DROP NOT NULL;";
            jdbcTemplate.execute(dropPasswordNotNullSql);
            log.info(">>> [DB Schema Sync] Step 2: password 제약 조건 완화 완료! ✅");

            // 3. 유령 id 및 is_active 컬럼 완전 삭제 (500 에러 근본 원인 제거)
            String dropGhostColumnsSql = "DO $$\n" +
                    "BEGIN\n" +
                    "    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='id') THEN\n" +
                    "        ALTER TABLE users DROP COLUMN id;\n" +
                    "        RAISE NOTICE '유령 id 컬럼을 삭제했습니다. ✅';\n" +
                    "    END IF;\n" +
                    "    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_active') THEN\n" +
                    "        ALTER TABLE users DROP COLUMN is_active;\n" +
                    "        RAISE NOTICE '유령 is_active 컬럼을 삭제했습니다. ✅';\n" +
                    "    END IF;\n" +
                    "END $$;";
            jdbcTemplate.execute(dropGhostColumnsSql);
            log.info(">>> [DB Schema Sync] Step 3: 모든 유령 컬럼(id, is_active) 삭제 완료! ✅");

            log.info(">>> [DB Schema Sync] 모든 스키마 보정 및 대청소가 성공적으로 끝났습니다! 🐘💨✨");

        } catch (Exception e) {
            log.error(">>> [DB Schema Sync] 보정 작업 중 오류 발생(이미 반영되었을 수 있음): {}", e.getMessage());
        }
    }
}
