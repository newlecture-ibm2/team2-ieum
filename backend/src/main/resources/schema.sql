-- ============================================================
-- IEUM (이음) 축제 플랫폼 DDL 스크립트
-- Database: PostgreSQL
-- 생성일: 2026-03-30
-- 설명: 프로젝트 전체 테이블 스키마 정의
-- ============================================================

-- ============================================================
-- 1. ENUM 타입 정의
-- ============================================================

-- 사용자 역할
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 축제 상태
DO $$ BEGIN
    CREATE TYPE festival_status AS ENUM ('UPCOMING', 'ONGOING', 'ENDED', 'HIDDEN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 축제 데이터 출처
DO $$ BEGIN
    CREATE TYPE festival_source AS ENUM ('API', 'MANUAL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 게시판 카테고리
DO $$ BEGIN
    CREATE TYPE board_category AS ENUM ('QNA', 'TIP', 'FOOD');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 신고 대상 타입
DO $$ BEGIN
    CREATE TYPE report_target_type AS ENUM ('REVIEW', 'POST', 'COMMENT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 신고 사유
DO $$ BEGIN
    CREATE TYPE report_reason AS ENUM ('SPAM', 'ABUSE', 'INAPPROPRIATE', 'FALSE_INFO', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 신고 처리 상태
DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('PENDING', 'RESOLVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 신고 처리 액션
DO $$ BEGIN
    CREATE TYPE report_action AS ENUM ('DELETE_CONTENT', 'WARN_USER', 'NONE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 문의 상태
DO $$ BEGIN
    CREATE TYPE inquiry_status AS ENUM ('PENDING', 'ANSWERED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 알림 타입
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('FESTIVAL_REMINDER', 'COMMENT_REPLY', 'REPORT_RESULT', 'NOTICE', 'SYSTEM');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================
-- 2. 테이블 생성
-- ============================================================

-- ------------------------------------------------------------
-- 2-1. 사용자 (users)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id              BIGSERIAL       PRIMARY KEY,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    password        VARCHAR(255)    NOT NULL,
    nickname        VARCHAR(20)     NOT NULL UNIQUE,
    phone           VARCHAR(20),
    profile_image   VARCHAR(500),
    role            user_role       NOT NULL DEFAULT 'USER',
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    is_marketing_agreed BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP
);

COMMENT ON TABLE  users                IS '사용자 테이블';
COMMENT ON COLUMN users.email          IS '로그인용 이메일 (고유)';
COMMENT ON COLUMN users.password       IS '암호화된 비밀번호';
COMMENT ON COLUMN users.nickname       IS '닉네임 (2~20자, 고유)';
COMMENT ON COLUMN users.phone          IS '전화번호';
COMMENT ON COLUMN users.profile_image  IS '프로필 이미지 URL';
COMMENT ON COLUMN users.role           IS '사용자 역할 (USER, ADMIN)';
COMMENT ON COLUMN users.is_active      IS '활성 여부 (정지 시 false)';

-- ------------------------------------------------------------
-- 2-2. 리프레시 토큰 (refresh_tokens)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL,
    token           VARCHAR(500)    NOT NULL UNIQUE,
    expires_at      TIMESTAMP       NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE  refresh_tokens       IS 'JWT 리프레시 토큰 저장';
COMMENT ON COLUMN refresh_tokens.token IS '리프레시 토큰 값';

-- ------------------------------------------------------------
-- 2-3. 축제 (festivals)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS festivals (
    id              BIGSERIAL       PRIMARY KEY,
    source_id       VARCHAR(100)    UNIQUE,
    source          festival_source NOT NULL DEFAULT 'MANUAL',
    title           VARCHAR(255)    NOT NULL,
    description     TEXT,
    overview        TEXT,
    location        VARCHAR(255),
    address         VARCHAR(500),
    start_date      DATE,
    end_date        DATE,
    status          festival_status NOT NULL DEFAULT 'UPCOMING',
    image_url       VARCHAR(500),
    thumbnail_url   VARCHAR(500),
    homepage        VARCHAR(500),
    tel             VARCHAR(50),
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,
    category        VARCHAR(10),
    category_mid    VARCHAR(10),
    category_sub    VARCHAR(10),
    area_code       VARCHAR(10),
    sigungu_code    VARCHAR(5),
    ldong_code      VARCHAR(20),
    event_place     VARCHAR(200),
    play_time       VARCHAR(200),
    program         TEXT,
    use_fee         VARCHAR(200),
    sponsor         VARCHAR(100),
    is_custom       BOOLEAN         NOT NULL DEFAULT FALSE,
    is_visible      BOOLEAN         NOT NULL DEFAULT TRUE,
    avg_rating      DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    review_count    INTEGER         NOT NULL DEFAULT 0,
    favorite_count  INTEGER         NOT NULL DEFAULT 0,
    view_count      INTEGER         NOT NULL DEFAULT 0,
    api_modified_at TIMESTAMP,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP
);

COMMENT ON TABLE  festivals                     IS '축제 정보 테이블';
COMMENT ON COLUMN festivals.source_id           IS '공공데이터 API의 contentId (중복 동기화 방지, UK)';
COMMENT ON COLUMN festivals.source              IS '데이터 출처 (API: 공공데이터, MANUAL: 수동등록)';
COMMENT ON COLUMN festivals.title               IS '축제 제목';
COMMENT ON COLUMN festivals.description         IS '축제 상세 설명 (관리자 입력)';
COMMENT ON COLUMN festivals.overview            IS '축제 개요 (공공API detailCommon1)';
COMMENT ON COLUMN festivals.location            IS '축제 장소명';
COMMENT ON COLUMN festivals.address             IS '축제 상세 주소';
COMMENT ON COLUMN festivals.start_date          IS '축제 시작일';
COMMENT ON COLUMN festivals.end_date            IS '축제 종료일';
COMMENT ON COLUMN festivals.status              IS '축제 상태 (UPCOMING, ONGOING, ENDED, HIDDEN)';
COMMENT ON COLUMN festivals.latitude            IS '위도 (지도 표시용)';
COMMENT ON COLUMN festivals.longitude           IS '경도 (지도 표시용)';
COMMENT ON COLUMN festivals.category            IS '대분류 코드 (공공API cat1)';
COMMENT ON COLUMN festivals.category_mid        IS '중분류 코드 (공공API cat2)';
COMMENT ON COLUMN festivals.category_sub        IS '소분류 코드 (공공API cat3)';
COMMENT ON COLUMN festivals.area_code           IS '시/도 코드 (공공데이터 API 기준)';
COMMENT ON COLUMN festivals.sigungu_code        IS '시군구 코드 (공공데이터 API 기준)';
COMMENT ON COLUMN festivals.ldong_code          IS '법정동 코드';
COMMENT ON COLUMN festivals.event_place         IS '행사 장소명 (공공API detailIntro1)';
COMMENT ON COLUMN festivals.play_time           IS '공연/행사 시간 (공공API detailIntro1)';
COMMENT ON COLUMN festivals.program             IS '행사 프로그램 (공공API detailIntro1)';
COMMENT ON COLUMN festivals.use_fee             IS '이용 요금 (공공API detailIntro1)';
COMMENT ON COLUMN festivals.sponsor             IS '주최 기관 (공공API detailIntro1)';
COMMENT ON COLUMN festivals.is_custom           IS '자체 기획 축제 여부';
COMMENT ON COLUMN festivals.is_visible          IS '노출 여부 (관리자 비공개 처리용)';
COMMENT ON COLUMN festivals.avg_rating          IS '평균 별점 (캐시)';
COMMENT ON COLUMN festivals.review_count        IS '리뷰 수 (캐시)';
COMMENT ON COLUMN festivals.favorite_count      IS '즐겨찾기 수 (캐시)';
COMMENT ON COLUMN festivals.view_count          IS '조회수';
COMMENT ON COLUMN festivals.api_modified_at     IS 'API 수정일 (증분 동기화 변경 감지용)';

-- ------------------------------------------------------------
-- 2-4. 리뷰 (reviews)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id              BIGSERIAL       PRIMARY KEY,
    festival_id     BIGINT          NOT NULL,
    user_id         BIGINT          NOT NULL,
    rating          INTEGER         NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content         VARCHAR(500)    NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP,

    CONSTRAINT fk_reviews_festival
        FOREIGN KEY (festival_id) REFERENCES festivals(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_reviews_user_festival
        UNIQUE (user_id, festival_id)
);

COMMENT ON TABLE  reviews              IS '축제 리뷰 테이블';
COMMENT ON COLUMN reviews.rating       IS '별점 (1~5)';
COMMENT ON COLUMN reviews.content      IS '리뷰 내용 (10~500자)';

-- ------------------------------------------------------------
-- 2-5. 즐겨찾기 (favorites)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS favorites (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL,
    festival_id     BIGINT          NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_favorites_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_favorites_festival
        FOREIGN KEY (festival_id) REFERENCES festivals(id) ON DELETE CASCADE,
    CONSTRAINT uq_favorites_user_festival
        UNIQUE (user_id, festival_id)
);

COMMENT ON TABLE  favorites            IS '축제 즐겨찾기 테이블';

-- ------------------------------------------------------------
-- 2-6. 커뮤니티 게시글 (posts)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS posts (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL,
    category        board_category  NOT NULL,
    title           VARCHAR(100)    NOT NULL,
    content         TEXT            NOT NULL,
    view_count      INTEGER         NOT NULL DEFAULT 0,
    comment_count   INTEGER         NOT NULL DEFAULT 0,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP,

    CONSTRAINT fk_posts_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE  posts                 IS '커뮤니티 게시글 테이블';
COMMENT ON COLUMN posts.category        IS '게시판 카테고리 (QNA, TIP, FOOD)';
COMMENT ON COLUMN posts.title           IS '게시글 제목 (2~100자)';
COMMENT ON COLUMN posts.content         IS '게시글 내용 (10~5000자)';
COMMENT ON COLUMN posts.view_count      IS '조회수';
COMMENT ON COLUMN posts.comment_count   IS '댓글 수 (캐시)';

-- ------------------------------------------------------------
-- 2-7. 댓글 (comments)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comments (
    id              BIGSERIAL       PRIMARY KEY,
    post_id         BIGINT          NOT NULL,
    user_id         BIGINT          NOT NULL,
    content         VARCHAR(1000)   NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP,

    CONSTRAINT fk_comments_post
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE  comments             IS '게시글 댓글 테이블';
COMMENT ON COLUMN comments.content     IS '댓글 내용 (1~1000자)';

-- ------------------------------------------------------------
-- 2-8. 신고 (reports)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
    id              BIGSERIAL           PRIMARY KEY,
    reporter_id     BIGINT              NOT NULL,
    target_type     report_target_type  NOT NULL,
    target_id       BIGINT              NOT NULL,
    reason          report_reason       NOT NULL,
    description     VARCHAR(500),
    status          report_status       NOT NULL DEFAULT 'PENDING',
    action          report_action,
    admin_note      VARCHAR(500),
    processed_at    TIMESTAMP,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reports_reporter
        FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_reports_reporter_target
        UNIQUE (reporter_id, target_type, target_id)
);

COMMENT ON TABLE  reports               IS '신고 접수 테이블';
COMMENT ON COLUMN reports.reporter_id   IS '신고자 (사용자 ID)';
COMMENT ON COLUMN reports.target_type   IS '신고 대상 종류 (REVIEW, POST, COMMENT)';
COMMENT ON COLUMN reports.target_id     IS '신고 대상 ID';
COMMENT ON COLUMN reports.reason        IS '신고 사유';
COMMENT ON COLUMN reports.description   IS '상세 사유 (최대 500자)';
COMMENT ON COLUMN reports.status        IS '처리 상태 (PENDING, RESOLVED, REJECTED)';
COMMENT ON COLUMN reports.action        IS '관리자 조치 (DELETE_CONTENT, WARN_USER, NONE)';
COMMENT ON COLUMN reports.admin_note    IS '관리자 메모';
COMMENT ON COLUMN reports.processed_at  IS '처리 완료 일시';

-- ------------------------------------------------------------
-- 2-8-1. 신고 처리 답변 (report_responses)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS report_responses (
    id              BIGSERIAL       PRIMARY KEY,
    report_id       BIGINT          NOT NULL,
    admin_id        BIGINT,
    action_type     VARCHAR(20)     NOT NULL,
    message         TEXT            NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_report_responses_report
        FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    CONSTRAINT fk_report_responses_admin
        FOREIGN KEY (admin_id) REFERENCES users(id)
);

COMMENT ON TABLE  report_responses              IS '신고 처리 답변 테이블';
COMMENT ON COLUMN report_responses.report_id    IS '신고 ID (FK → reports)';
COMMENT ON COLUMN report_responses.admin_id     IS '처리한 관리자 ID (FK → users)';
COMMENT ON COLUMN report_responses.action_type  IS '처리 유형 (DISMISS, DELETE)';
COMMENT ON COLUMN report_responses.message      IS '관리자 답변 내용';

-- ------------------------------------------------------------
-- 2-9. 공지사항 (notices)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notices (
    notice_id       BIGSERIAL       PRIMARY KEY,
    title           VARCHAR(255)    NOT NULL,
    content         TEXT            NOT NULL,
    is_pinned       BOOLEAN         NOT NULL DEFAULT FALSE,
    view_count      INTEGER         NOT NULL DEFAULT 0,
    start_date      TIMESTAMP,
    end_date        TIMESTAMP,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP
);

COMMENT ON TABLE  notices              IS '공지사항 테이블';
COMMENT ON COLUMN notices.is_pinned    IS '상단 고정 여부';
COMMENT ON COLUMN notices.view_count   IS '조회수';
COMMENT ON COLUMN notices.start_date   IS '게시 시작일 (NULL이면 즉시 게시)';
COMMENT ON COLUMN notices.end_date     IS '게시 종료일 (NULL이면 무기한)';

-- ------------------------------------------------------------
-- 2-10. 1:1 문의 (inquiries)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inquiries (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL,
    title           VARCHAR(200)    NOT NULL,
    content         TEXT            NOT NULL,
    status          inquiry_status  NOT NULL DEFAULT 'PENDING',
    answer          TEXT,
    answered_at     TIMESTAMP,
    answered_by     BIGINT,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inquiries_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_inquiries_answered_by
        FOREIGN KEY (answered_by) REFERENCES users(id)
);

COMMENT ON TABLE  inquiries                 IS '1:1 문의 테이블';
COMMENT ON COLUMN inquiries.user_id         IS '문의 작성자 (사용자 ID)';
COMMENT ON COLUMN inquiries.title           IS '문의 제목';
COMMENT ON COLUMN inquiries.content         IS '문의 내용';
COMMENT ON COLUMN inquiries.status          IS '처리 상태 (PENDING: 대기, ANSWERED: 답변완료)';
COMMENT ON COLUMN inquiries.answer          IS '관리자 답변 내용';
COMMENT ON COLUMN inquiries.answered_at     IS '답변 일시';
COMMENT ON COLUMN inquiries.answered_by     IS '답변한 관리자 ID (FK → users)';

-- ------------------------------------------------------------
-- 2-11. 알림 (notifications)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id              BIGSERIAL           PRIMARY KEY,
    user_id         BIGINT              NOT NULL,
    type            notification_type   NOT NULL,
    title           VARCHAR(255)        NOT NULL,
    message         TEXT,
    is_read         BOOLEAN             NOT NULL DEFAULT FALSE,
    reference_id    BIGINT,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE  notifications                 IS '사용자 알림 테이블';
COMMENT ON COLUMN notifications.type            IS '알림 유형';
COMMENT ON COLUMN notifications.is_read         IS '읽음 여부';
COMMENT ON COLUMN notifications.reference_id    IS '참조 대상 ID (축제, 게시글 등)';

-- ------------------------------------------------------------
-- 2-12. FCM 토큰 (fcm_tokens)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fcm_tokens (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL,
    token           VARCHAR(500)    NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_fcm_tokens_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_fcm_tokens_user_token
        UNIQUE (user_id, token)
);

COMMENT ON TABLE  fcm_tokens           IS 'FCM 푸시 알림 토큰 테이블';

-- ------------------------------------------------------------
-- 2-13. 배치 로그 (batch_log)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS batch_log (
    id              BIGSERIAL       PRIMARY KEY,
    batch_id        VARCHAR(10)     NOT NULL,
    batch_name      VARCHAR(100)    NOT NULL,
    trigger_type    VARCHAR(10)     NOT NULL,
    triggered_by    BIGINT,
    status          VARCHAR(10)     NOT NULL DEFAULT 'RUNNING',
    started_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    finished_at     TIMESTAMP,
    execution_time  VARCHAR(20),
    total_count     INTEGER         NOT NULL DEFAULT 0,
    insert_count    INTEGER         NOT NULL DEFAULT 0,
    update_count    INTEGER         NOT NULL DEFAULT 0,
    skip_count      INTEGER         NOT NULL DEFAULT 0,
    fail_count      INTEGER         NOT NULL DEFAULT 0,
    error_message   TEXT,
    error_detail    TEXT,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_batch_log_triggered_by
        FOREIGN KEY (triggered_by) REFERENCES users(id)
);

COMMENT ON TABLE  batch_log                     IS '배치 실행 로그 테이블';
COMMENT ON COLUMN batch_log.batch_id            IS '배치 식별자 (BAT-001, BAT-002, BAT-003)';
COMMENT ON COLUMN batch_log.batch_name          IS '배치명';
COMMENT ON COLUMN batch_log.trigger_type        IS '실행 유형 (AUTO: 스케줄러, MANUAL: 관리자)';
COMMENT ON COLUMN batch_log.triggered_by        IS '수동 실행 시 관리자 ID (FK → users, NULL 허용)';
COMMENT ON COLUMN batch_log.status              IS '실행 상태 (RUNNING, SUCCESS, FAILED)';
COMMENT ON COLUMN batch_log.execution_time      IS '소요 시간 (HH:mm:ss)';
COMMENT ON COLUMN batch_log.total_count         IS '총 처리 건수';
COMMENT ON COLUMN batch_log.insert_count        IS '신규 등록 건수';
COMMENT ON COLUMN batch_log.update_count        IS '갱신 건수';
COMMENT ON COLUMN batch_log.skip_count          IS '스킵 건수';
COMMENT ON COLUMN batch_log.fail_count          IS '실패 건수';
COMMENT ON COLUMN batch_log.error_message       IS '에러 메시지';
COMMENT ON COLUMN batch_log.error_detail        IS '스택 트레이스';


-- ============================================================
-- 3. 인덱스 생성
-- ============================================================

-- users
CREATE INDEX IF NOT EXISTS idx_users_email         ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role           ON users(role);

-- refresh_tokens
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user  ON refresh_tokens(user_id);

-- festivals
CREATE INDEX IF NOT EXISTS idx_festivals_status     ON festivals(status);
CREATE INDEX IF NOT EXISTS idx_festivals_start_date ON festivals(start_date);
CREATE INDEX IF NOT EXISTS idx_festivals_end_date   ON festivals(end_date);
CREATE INDEX IF NOT EXISTS idx_festivals_area_code  ON festivals(area_code);
CREATE INDEX IF NOT EXISTS idx_festivals_source_id  ON festivals(source_id);
CREATE INDEX IF NOT EXISTS idx_festivals_location   ON festivals(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_festivals_sigungu    ON festivals(sigungu_code);
CREATE INDEX IF NOT EXISTS idx_festivals_category   ON festivals(category);

-- reviews
CREATE INDEX IF NOT EXISTS idx_reviews_festival     ON reviews(festival_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user         ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at   ON reviews(created_at DESC);

-- favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user       ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_festival   ON favorites(festival_id);

-- posts
CREATE INDEX IF NOT EXISTS idx_posts_user           ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_category       ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created_at     ON posts(created_at DESC);

-- comments
CREATE INDEX IF NOT EXISTS idx_comments_post        ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user        ON comments(user_id);

-- reports
CREATE INDEX IF NOT EXISTS idx_reports_status       ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_target       ON reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter     ON reports(reporter_id);

-- report_responses
CREATE INDEX IF NOT EXISTS idx_report_responses_report ON report_responses(report_id);

-- notices
CREATE INDEX IF NOT EXISTS idx_notices_pinned       ON notices(is_pinned DESC, created_at DESC);

-- inquiries
CREATE INDEX IF NOT EXISTS idx_inquiries_user       ON inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status     ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user   ON notifications(user_id, is_read, created_at DESC);

-- batch_log
CREATE INDEX IF NOT EXISTS idx_batch_log_batch_id   ON batch_log(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_log_status     ON batch_log(status);
CREATE INDEX IF NOT EXISTS idx_batch_log_started_at ON batch_log(started_at DESC);


-- ============================================================
-- 4. 초기 데이터 (관리자 계정)
-- ============================================================
-- 비밀번호: admin1234 (BCrypt 인코딩 필요 — 아래는 플레이스홀더)
-- 실제 운영 시 DataInitializer 또는 별도 스크립트에서 인코딩된 비밀번호로 삽입

-- INSERT INTO users (email, password, nickname, role)
-- VALUES ('admin@ieum.com', '$2a$10$ENCODED_PASSWORD_HERE', '관리자', 'ADMIN')
-- ON CONFLICT (email) DO NOTHING;
