package com.ieum.admin.member.application.port.in;

/**
 * 관리자 회원 역할 변경 UseCase (USER ↔ ADMIN)
 */
public interface UpdateMemberRoleUseCase {
    void updateRole(Long userId, String newRole);
}
