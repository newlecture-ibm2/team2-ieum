package com.ieum.admin.member.application.service;

import com.ieum.admin.member.application.port.in.GetMemberDetailUseCase;
import com.ieum.admin.member.application.port.in.GetMemberListUseCase;
import com.ieum.admin.member.application.port.in.UpdateMemberStatusUseCase;
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
public class MemberAdminService implements GetMemberListUseCase, UpdateMemberStatusUseCase, GetMemberDetailUseCase {

    private final MemberPort memberPort;

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

    @Override
    @Transactional
    public void updateStatus(Long userId, String newStatus) {
        memberPort.updateStatus(userId, newStatus);
    }

    @Override
    public Optional<MemberItem> getMember(Long userId) {
        return memberPort.findById(userId).map(this::toItem);
    }

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
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .deletedAt(m.getDeletedAt())
                .reportedCount(m.getReportedCount())
                .build();
    }
}
