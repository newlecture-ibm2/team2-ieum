package com.ieum.admin.member.application.service;

import com.ieum.admin.member.application.port.in.*;
import com.ieum.admin.member.application.port.out.MemberPort;
import com.ieum.admin.member.application.result.MemberItem;
import com.ieum.admin.member.application.result.MemberListResult;
import com.ieum.admin.member.domain.model.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * 회원 관리 서비스 (UseCase 구현체)
 * - Port 인터페이스만 의존
 * - Entity 직접 사용 금지
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberAdminService implements
        GetMemberListUseCase,
        GetMemberDetailUseCase,
        UpdateMemberStatusUseCase,
        DeleteMemberUseCase,
        UpdateMemberRoleUseCase {

    private final MemberPort memberPort;

    /* ── 회원 목록 조회 ── */
    @Override
    public MemberListResult getMembers(int page, int size, String status, String role,
                                       String searchType, String keyword) {
        Page<Member> members = memberPort.findAll(status, role, searchType, keyword,
                PageRequest.of(page - 1, size));

        return MemberListResult.builder()
                .content(members.getContent().stream().map(this::toItem).toList())
                .totalPages(members.getTotalPages())
                .totalElements(members.getTotalElements())
                .activeCount(memberPort.countByStatus("ACTIVE"))
                .suspendedCount(memberPort.countByStatus("SUSPENDED"))
                .deletedCount(memberPort.countByStatus("DELETED"))
                .build();
    }

    /* ── 회원 상세 조회 ── */
    @Override
    public Optional<MemberItem> getMember(Long userId) {
        return memberPort.findById(userId).map(this::toItem);
    }

    /* ── 회원 상태 변경 (ACTIVE ↔ SUSPENDED) ── */
    @Override
    @Transactional
    public void updateStatus(Long userId, String newStatus) {
        if ("SUSPENDED".equals(newStatus)) {
            // 정지 시 기본 7일 정지
            memberPort.suspendMember(userId, 7);
        } else {
            memberPort.updateStatus(userId, newStatus);
        }
    }

    /* ── 관리자 강제 탈퇴 ── */
    @Override
    @Transactional
    public void deleteMember(Long userId) {
        memberPort.deleteMember(userId);
    }

    /* ── 역할 변경 (USER ↔ ADMIN) ── */
    @Override
    @Transactional
    public void updateRole(Long userId, String newRole) {
        memberPort.updateRole(userId, newRole);
    }

    /* ── Domain → Result 변환 ── */
    private MemberItem toItem(Member m) {
        return MemberItem.builder()
                .userId(m.getUserId())
                .loginId(m.getLoginId())
                .name(m.getName())
                .nickname(m.getNickname())
                .phone(m.getPhone())
                .profileImage(m.getProfileImage())
                .role(m.getRole())
                .status(m.getStatus())
                .suspendedUntil(m.getSuspendedUntil())
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .deletedAt(m.getDeletedAt())
                .reportedCount(m.getReportedCount())
                .build();
    }
}
