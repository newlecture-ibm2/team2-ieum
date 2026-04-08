package com.ieum.admin.member.application.port.in;

/**
 * 회원 상태 변경 UseCase (정지 / 해제)
 */
public interface UpdateMemberStatusUseCase {
    void updateStatus(Long userId, String newStatus);
}
