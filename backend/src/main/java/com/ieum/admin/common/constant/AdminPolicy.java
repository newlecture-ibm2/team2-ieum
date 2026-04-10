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
}
