package com.ieum.admin.member.application.service;

import com.ieum.admin.common.constant.AdminPolicy;
import com.ieum.admin.member.application.port.in.*;
import com.ieum.admin.member.application.port.out.MemberPort;
import com.ieum.admin.member.application.result.MemberItem;
import com.ieum.admin.member.application.result.MemberListResult;
import com.ieum.admin.member.domain.model.Member;
import com.ieum.admin.member.domain.model.MemberStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * 회원 관리 서비스 (UseCase 구현체)
 *
 * <p>Port 인터페이스만 의존하며, Entity를 직접 사용하지 않는다.</p>
 *
 * <h3>상태 정책</h3>
 * <ul>
 *   <li>ACTIVE — 정상 회원</li>
 *   <li>SUSPENDED — 정지 회원 (쓰기 제한, 로그인은 가능하며 실제 차단은 각 user 도메인 서비스 책임)</li>
 *   <li>WITHDRAWAL — 탈퇴 유예 (user/auth에서 설정, admin에서 직접 설정하지 않음)</li>
 *   <li>DELETED — 관리자 삭제 (WITHDRAWAL과 의미가 다름)</li>
 * </ul>
 *
 * <h3>role 변경 주의</h3>
 * <p>DB role은 즉시 반영되지만, JWT에는 즉시 반영되지 않는다.
 * 해당 회원이 재로그인 또는 Refresh Token 갱신 후 새 권한이 적용된다.</p>
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
                .activeCount(memberPort.countByStatus(MemberStatus.ACTIVE))
                .suspendedCount(memberPort.countByStatus(MemberStatus.SUSPENDED))
                .deletedCount(memberPort.countByStatus(MemberStatus.DELETED))
                .build();
    }

    /* ── 회원 상세 조회 ── */
    @Override
    public Optional<MemberItem> getMember(Long userId) {
        return memberPort.findById(userId).map(this::toItem);
    }

    /*
     * ── 회원 상태 변경 (ACTIVE ↔ SUSPENDED) ──
     * SUSPENDED는 로그인 차단 상태가 아니라 쓰기 제한 상태다.
     * 실제 쓰기 제한은 user 도메인의 각 서비스(게시글/댓글/리뷰/즐겨찾기)에서 처리한다.
     * admin은 상태만 관리한다.
     */
    @Override
    @Transactional
    public void updateStatus(Long userId, String newStatus) {
        if (MemberStatus.SUSPENDED.equals(newStatus)) {
            memberPort.suspendMember(userId, AdminPolicy.SUSPENSION_DAYS);
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

    /*
     * ── 역할 변경 (USER ↔ ADMIN) ──
     * role 변경은 DB에는 즉시 반영되지만 JWT에는 즉시 반영되지 않는다.
     * 해당 회원이 재로그인 또는 Refresh Token을 갱신한 이후에 적용된다.
     */
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
