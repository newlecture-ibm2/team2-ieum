package com.ieum.user.auth.application.port.in;

/**
 * [Inbound Port] 사용자 정지 상태 확인 UseCase
 * 사용자 도메인을 외부에 노출하지 않고, 사용자 데이터 소유자인 user 모듈이 타 모듈에게 제공하는 공식 창구입니다.
 */
public interface CheckUserSuspensionUseCase {
    
    /**
     * 해당 사용자가 현재 정지 상태인지 확인합니다.
     * @param userId 사용자 ID
     * @return 정지 상태이면 true
     */
    boolean isSuspended(Long userId);
}
