package com.ieum.admin.common.constant;

/**
 * 관리자 업무 정책 상수
 * - admin 영역 전반에서 사용되는 정책 수치를 한 곳에서 관리한다
 * - 정책 변경 시 이 파일만 수정하면 된다
 */
public final class AdminPolicy {

    private AdminPolicy() {
        // 인스턴스 생성 방지
    }

    /** 회원 정지 기본 기간 (일) */
    public static final int SUSPENSION_DAYS = 7;

    /* ── 신고 처리 DB 액션 (PostgreSQL report_action ENUM 매핑) ── */

    /** 콘텐츠 삭제 조치 */
    public static final String DB_ACTION_DELETE_CONTENT = "DELETE_CONTENT";

    /** 회원 경고 조치 */
    public static final String DB_ACTION_WARN_USER = "WARN_USER";

    /** 미조치 (반려) */
    public static final String DB_ACTION_NONE = "NONE";
}
