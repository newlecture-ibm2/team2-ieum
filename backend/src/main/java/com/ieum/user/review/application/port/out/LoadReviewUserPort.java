package com.ieum.user.review.application.port.out;

/**
 * 사용자 조회 포트 (Port OUT)
 * - Review 모듈이 User 모듈의 adapter를 직접 참조하지 않도록 중재
 */
public interface LoadReviewUserPort {

    /**
     * 로그인 ID(문자열)로 사용자의 내부 userId를 조회
     *
     * @param loginId 로그인 ID
     * @return 사용자의 내부 ID
     * @throws IllegalArgumentException 사용자를 찾을 수 없는 경우
     */
    Long resolveUserId(String loginId);
}
