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
    CREATE TYPE festival_status AS ENUM ('UPCOMING', 'ONGOING', 'ENDED');
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

-- 설문 문항 타입
DO $$ BEGIN
    CREATE TYPE question_type AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TEXT');
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
    title           VARCHAR(255)    NOT NULL,
    description     TEXT,
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
    source          festival_source NOT NULL DEFAULT 'MANUAL',
    source_id       VARCHAR(100),
    area_code       VARCHAR(10),
    avg_rating      DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    review_count    INTEGER         NOT NULL DEFAULT 0,
    favorite_count  INTEGER         NOT NULL DEFAULT 0,
    view_count      INTEGER         NOT NULL DEFAULT 0,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP
);

COMMENT ON TABLE  festivals                 IS '축제 정보 테이블';
COMMENT ON COLUMN festivals.title           IS '축제 제목';
COMMENT ON COLUMN festivals.description     IS '축제 상세 설명';
COMMENT ON COLUMN festivals.location        IS '축제 장소명';
COMMENT ON COLUMN festivals.address         IS '축제 상세 주소';
COMMENT ON COLUMN festivals.start_date      IS '축제 시작일';
COMMENT ON COLUMN festivals.end_date        IS '축제 종료일';
COMMENT ON COLUMN festivals.status          IS '축제 상태 (UPCOMING, ONGOING, ENDED)';
COMMENT ON COLUMN festivals.latitude        IS '위도 (지도 표시용)';
COMMENT ON COLUMN festivals.longitude       IS '경도 (지도 표시용)';
COMMENT ON COLUMN festivals.source          IS '데이터 출처 (API: 공공데이터, MANUAL: 수동등록)';
COMMENT ON COLUMN festivals.source_id       IS '공공데이터 API의 contentId (중복 동기화 방지)';
COMMENT ON COLUMN festivals.area_code       IS '지역 코드 (공공데이터 API 기준)';
COMMENT ON COLUMN festivals.avg_rating      IS '평균 별점 (캐시)';
COMMENT ON COLUMN festivals.review_count    IS '리뷰 수 (캐시)';
COMMENT ON COLUMN festivals.favorite_count  IS '즐겨찾기 수 (캐시)';
COMMENT ON COLUMN festivals.view_count      IS '조회수';

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
-- 2-9. 공지사항 (notices)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notices (
    id              BIGSERIAL       PRIMARY KEY,
    title           VARCHAR(255)    NOT NULL,
    content         TEXT            NOT NULL,
    is_pinned       BOOLEAN         NOT NULL DEFAULT FALSE,
    view_count      INTEGER         NOT NULL DEFAULT 0,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP
);

COMMENT ON TABLE  notices              IS '공지사항 테이블';
COMMENT ON COLUMN notices.is_pinned    IS '상단 고정 여부';
COMMENT ON COLUMN notices.view_count   IS '조회수';

-- ------------------------------------------------------------
-- 2-10. 설문 (surveys)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS surveys (
    id              BIGSERIAL       PRIMARY KEY,
    title           VARCHAR(255)    NOT NULL,
    description     TEXT,
    start_date      DATE,
    end_date        DATE,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    total_responses INTEGER         NOT NULL DEFAULT 0,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE  surveys              IS '설문조사 테이블';
COMMENT ON COLUMN surveys.total_responses IS '총 응답 수 (캐시)';

-- ------------------------------------------------------------
-- 2-11. 설문 문항 (survey_questions)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS survey_questions (
    id              BIGSERIAL       PRIMARY KEY,
    survey_id       BIGINT          NOT NULL,
    question_order  INTEGER         NOT NULL,
    type            question_type   NOT NULL,
    question        VARCHAR(500)    NOT NULL,
    options         JSONB,

    CONSTRAINT fk_survey_questions_survey
        FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
);

COMMENT ON TABLE  survey_questions          IS '설문 문항 테이블';
COMMENT ON COLUMN survey_questions.question_order IS '문항 순서';
COMMENT ON COLUMN survey_questions.type     IS '문항 유형 (SINGLE_CHOICE, MULTIPLE_CHOICE, TEXT)';
COMMENT ON COLUMN survey_questions.options  IS '선택지 목록 (JSON 배열, TEXT 유형에는 NULL)';

-- ------------------------------------------------------------
-- 2-12. 설문 응답 (survey_responses)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS survey_responses (
    id              BIGSERIAL       PRIMARY KEY,
    survey_id       BIGINT          NOT NULL,
    user_id         BIGINT          NOT NULL,
    answers         JSONB           NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_survey_responses_survey
        FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
    CONSTRAINT fk_survey_responses_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_survey_responses_user_survey
        UNIQUE (user_id, survey_id)
);

COMMENT ON TABLE  survey_responses          IS '설문 응답 테이블';
COMMENT ON COLUMN survey_responses.answers  IS '응답 데이터 (JSON)';

-- ------------------------------------------------------------
-- 2-13. 알림 (notifications)
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
-- 2-14. FCM 토큰 (fcm_tokens)
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

-- notices
CREATE INDEX IF NOT EXISTS idx_notices_pinned       ON notices(is_pinned DESC, created_at DESC);

-- surveys
CREATE INDEX IF NOT EXISTS idx_surveys_active       ON surveys(is_active);

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user   ON notifications(user_id, is_read, created_at DESC);


-- ============================================================
-- 4. 초기 데이터 (관리자 계정)
-- ============================================================
-- 비밀번호: admin1234 (BCrypt 인코딩 필요 — 아래는 플레이스홀더)
-- 실제 운영 시 DataInitializer 또는 별도 스크립트에서 인코딩된 비밀번호로 삽입

-- INSERT INTO users (email, password, nickname, role)
-- VALUES ('admin@ieum.com', '$2a$10$ENCODED_PASSWORD_HERE', '관리자', 'ADMIN')
-- ON CONFLICT (email) DO NOTHING;
