package com.ieum.admin.member.application.port.in;

/**
 * 관리자 회원 강제 탈퇴 UseCase
 */
public interface DeleteMemberUseCase {
    void deleteMember(Long userId);
}
