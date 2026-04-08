package com.ieum.global.init;

import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DbConstraintFixer {

    private final JdbcTemplate jdbcTemplate;

    public DbConstraintFixer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void fixConstraints() {
        try {
            // 리뷰 테이블(reviews)에 예전에 만들어졌던 유니크 제약조건(UNIQUE)이 남아있어서
            // 1인 다축제 다리뷰 작성 시도를 DB 단에서 튕겨내고 500 에러를 만들고 있습니다.
            // 서버 가동 시 해당 제약조건을 찾아 깔끔하게 삭제합니다.
            jdbcTemplate.execute("""
                        DO $$
                        DECLARE
                            r record;
                        BEGIN
                            FOR r IN
                                SELECT constraint_name
                                FROM information_schema.table_constraints
                                WHERE table_name = 'reviews' AND constraint_type = 'UNIQUE'
                            LOOP
                                EXECUTE 'ALTER TABLE reviews DROP CONSTRAINT ' || quote_ident(r.constraint_name);
                            END LOOP;
                        END
                        $$;

                        -- 팀원 분이 DB 초기화 과정에서 수동 insert를 진행하셨다면 sequence 값이 꼬였을 수 있습니다.
                        -- (리뷰 등록 시 새 아이디 발급과 기존 아이디 충돌로 인한 500 에러 해결)
                        DO $$
                        DECLARE
                            max_id integer;
                        BEGIN
                            SELECT COALESCE(MAX(id), 1) INTO max_id FROM reviews;
                            EXECUTE 'ALTER SEQUENCE reviews_id_seq RESTART WITH ' || (max_id + 1);
                        EXCEPTION
                            WHEN undefined_table THEN
                                -- 시퀀스 이름이 다를 수 있으므로 무시
                                NULL;
                        END
                        $$;
                    """);
            System.out.println("========== SUCCESS: DROPPED UNIQUE CONSTRAINTS ON REVIEWS TABLE ==========");
        } catch (Exception e) {
            System.err.println("========== FAIL TO DROP REVIEWS CONSTRAINTS: " + e.getMessage() + " ==========");
        }
    }
}
