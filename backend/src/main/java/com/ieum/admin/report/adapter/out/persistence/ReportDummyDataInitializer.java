package com.ieum.admin.report.adapter.out.persistence;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.ieum.admin.common.constant.AdminPolicy;
import com.ieum.global.common.enums.ReportReason;
import com.ieum.global.common.enums.ReportStatus;
import com.ieum.global.common.enums.TargetType;

/**
 * [개발용] 신고 더미 데이터 초기화
 * local 프로파일에서만 실행
 */
@Slf4j
@Component
@Profile("local")
@RequiredArgsConstructor
public class ReportDummyDataInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbc;

    @Override
    public void run(String... args) {
        // 이미 데이터 있으면 스킵
        Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM reports", Integer.class);
        if (count != null && count > 0) {
            log.info("========== 신고 더미 데이터 이미 존재 ({}건), 스킵 ==========", count);
            return;
        }

        // 사용자 ID 가져오기 — 없으면 테스트 유저 생성
        Long userId;
        try {
            userId = jdbc.queryForObject("SELECT user_id FROM users LIMIT 1", Long.class);
        } catch (Exception e) {
            log.info("========== users 테이블 비어있음, 테스트 유저 생성 ==========");
            jdbc.update("INSERT INTO users (login_id, password, nickname, role) VALUES (?, ?, ?, 'USER') ON CONFLICT (login_id) DO NOTHING",
                    "user01", "$2a$10$dummyHashedPassword000000000000000000000000", "축제매니아");
            jdbc.update("INSERT INTO users (login_id, password, nickname, role) VALUES (?, ?, ?, 'USER') ON CONFLICT (login_id) DO NOTHING",
                    "user02", "$2a$10$dummyHashedPassword000000000000000000000000", "여행가");
            jdbc.update("INSERT INTO users (login_id, password, nickname, role) VALUES (?, ?, ?, 'USER') ON CONFLICT (login_id) DO NOTHING",
                    "user03", "$2a$10$dummyHashedPassword000000000000000000000000", "먹방킹");
            userId = jdbc.queryForObject("SELECT user_id FROM users LIMIT 1", Long.class);
        }

        log.info("========== 신고 더미 데이터 삽입 시작 (reporter_id={}) ==========", userId);

        String sql = "INSERT INTO reports (reporter_id, target_type, target_id, reason, description, status, created_at) VALUES (?, ?::report_target_type, ?, ?::report_reason, ?, ?::report_status, NOW() - INTERVAL '1 day' * ?)";

        jdbc.update(sql, userId, TargetType.REVIEW.name(), 1, ReportReason.SPAM.name(), "광고성 리뷰입니다. 축제와 무관한 홍보글이 포함되어 있습니다.", ReportStatus.PENDING.name(), 1);
        jdbc.update(sql, userId, TargetType.COMMENT.name(), 5, ReportReason.ABUSE.name(), "댓글에 욕설과 비방이 포함되어 있습니다.", ReportStatus.PENDING.name(), 2);
        jdbc.update(sql, userId, TargetType.POST.name(), 3, ReportReason.INAPPROPRIATE.name(), "부적절한 이미지가 포함된 게시글입니다.", ReportStatus.PENDING.name(), 3);
        jdbc.update(sql, userId, TargetType.REVIEW.name(), 7, ReportReason.FALSE_INFO.name(), "허위 정보가 포함된 리뷰입니다. 실제 방문하지 않은 것으로 보입니다.", ReportStatus.RESOLVED.name(), 5);
        jdbc.update(sql, userId, TargetType.COMMENT.name(), 12, ReportReason.OTHER.name(), "해당 댓글에 개인정보가 노출되어 있습니다.", ReportStatus.REJECTED.name(), 7);

        // RESOLVED 건은 action도 세팅
        jdbc.update("UPDATE reports SET action = '" + AdminPolicy.DB_ACTION_DELETE_CONTENT + "'::report_action, admin_note = '스팸 확인, 삭제 처리', processed_at = NOW() WHERE status = '" + ReportStatus.RESOLVED.name() + "'");
        jdbc.update("UPDATE reports SET action = '" + AdminPolicy.DB_ACTION_NONE + "'::report_action, admin_note = '신고 내용 확인 결과 문제 없음', processed_at = NOW() WHERE status = '" + ReportStatus.REJECTED.name() + "'");

        log.info("========== 신고 더미 데이터 5건 삽입 완료 ==========");
    }
}
