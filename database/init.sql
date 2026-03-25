-- 지역 축제 통합 정보 플랫폼 — DDL 초안
-- PostgreSQL 17

-- ============================================
-- 1. 사용자 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    nickname    VARCHAR(50)  NOT NULL,
    profile_image VARCHAR(500),
    role        VARCHAR(20)  NOT NULL DEFAULT 'USER',  -- USER / ADMIN
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. 축제 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS festivals (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    address     VARCHAR(500),
    latitude    DECIMAL(10, 7),
    longitude   DECIMAL(10, 7),
    category    VARCHAR(100),
    image_url   VARCHAR(500),
    source      VARCHAR(50) DEFAULT 'API',
    status      VARCHAR(20) NOT NULL DEFAULT 'UPCOMING',  -- UPCOMING / ONGOING / ENDED
    view_count  INTEGER DEFAULT 0,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. 리뷰 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id),
    festival_id BIGINT NOT NULL REFERENCES festivals(id),
    rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    content     TEXT,
    image_url   VARCHAR(500),
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. 즐겨찾기 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id),
    festival_id BIGINT NOT NULL REFERENCES festivals(id),
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, festival_id)
);

-- ============================================
-- 5. 게시글 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id),
    board_type  VARCHAR(20) NOT NULL,  -- QNA / TIP / FOOD
    title       VARCHAR(255) NOT NULL,
    content     TEXT NOT NULL,
    image_url   VARCHAR(500),
    view_count  INTEGER DEFAULT 0,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. 댓글 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id),
    post_id     BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    content     TEXT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 7. 공지사항 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS notices (
    id          BIGSERIAL PRIMARY KEY,
    admin_id    BIGINT NOT NULL REFERENCES users(id),
    title       VARCHAR(255) NOT NULL,
    content     TEXT NOT NULL,
    is_popup    BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 8. 신고 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
    id          BIGSERIAL PRIMARY KEY,
    reporter_id BIGINT NOT NULL REFERENCES users(id),
    target_type VARCHAR(20) NOT NULL,  -- POST / REVIEW / COMMENT
    target_id   BIGINT NOT NULL,
    reason      TEXT NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING / RESOLVED / REJECTED
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 인덱스
-- ============================================
CREATE INDEX IF NOT EXISTS idx_festivals_status ON festivals(status);
CREATE INDEX IF NOT EXISTS idx_festivals_dates ON festivals(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_reviews_festival ON reviews(festival_id);
CREATE INDEX IF NOT EXISTS idx_posts_board_type ON posts(board_type);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
