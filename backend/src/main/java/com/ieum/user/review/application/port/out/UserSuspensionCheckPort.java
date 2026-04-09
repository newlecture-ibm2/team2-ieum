package com.ieum.user.review.application.port.out;

/**
 * [Output Port] 사용자 정지 상태 확인
 * 리뷰 모듈이 user 도메인에 직접 의존하지 않도록 별도 포트로 분리합니다.
 */
public interface UserSuspensionCheckPort {

    /**
     * 해당 사용자가 현재 정지 상태인지 확인합니다.
     * @param userId 사용자 ID
     * @return 정지 상태이면 true
     */
    boolean isSuspended(Long userId);
}
