-- ============================================================
-- IEUM Demo DB Reset Script
-- 용도: 데모/발표 준비 시 전체 DB 초기화
-- 실행: docker exec -i ieum-db psql -U ieum -d ieum < reset.sql
-- ============================================================

-- 1. 활동/관계 테이블 (FK 역순)
TRUNCATE TABLE fcm_tokens, notifications, batch_log,
    report_responses, reports, inquiries,
    post_likes, comments, posts,
    favorites, reviews, refresh_tokens,
    notices, festivals, users
CASCADE;

-- 2. Master 테이블 (앱 기동 시 자동 복원)
TRUNCATE TABLE festival_master_sigungu, festival_master_region, festival_master_category CASCADE;

-- 3. 첨부파일 (존재 시)
TRUNCATE TABLE attachments CASCADE;

-- 4. 전체 Sequence 리셋
DO $$
DECLARE seq RECORD;
BEGIN
    FOR seq IN
        SELECT sequencename FROM pg_sequences WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER SEQUENCE %I RESTART WITH 1', seq.sequencename);
    END LOOP;
END $$;

-- 확인
SELECT 'RESET COMPLETE' AS status,
       (SELECT COUNT(*) FROM users) AS users_count,
       (SELECT COUNT(*) FROM festivals) AS festivals_count;
