package com.ieum.admin.member.application.service;

import com.ieum.admin.common.constant.AdminPolicy;
import com.ieum.admin.member.application.port.in.*;
import com.ieum.admin.member.application.port.out.MemberPort;
import com.ieum.admin.member.application.result.MemberItem;
import com.ieum.admin.member.application.result.MemberListResult;
import com.ieum.admin.member.domain.model.Member;
import com.ieum.admin.member.domain.model.MemberStatus;
import com.ieum.user.auth.domain.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;

import com.ieum.user.deletion.application.port.in.ForceDeleteUserUseCase;

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
 * <h3>인가 규칙 (v2 — 자기 자신 차단 + 관리자 보호)</h3>
 * <ul>
 *   <li>관리자는 자기 자신의 상태 / 권한 / 탈퇴를 변경할 수 없다.</li>
 *   <li>관리자는 다른 관리자 계정의 상태 / 권한 / 탈퇴를 변경할 수 없다.</li>
 *   <li>슈퍼 관리자 체계가 도입되면 관리자 간 관리가 확장될 수 있다.</li>
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
    private final ForceDeleteUserUseCase forceDeleteUserUseCase;

    /* ── 허용된 정렬 컬럼 (보안: 임의 필드 정렬 방지) ── */
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("createdAt", "nickname", "name", "loginId", "reportedCount");

    /* ── 회원 목록 조회 ── */
    @Override
    public MemberListResult getMembers(int page, int size, String status, String role,
                                       String provider, String searchType, String keyword,
                                       String sortBy, String sortDirection) {
        // 정렬 기준 검증 및 기본값
        String field = (sortBy != null && ALLOWED_SORT_FIELDS.contains(sortBy)) ? sortBy : "createdAt";
        Sort.Direction dir = "asc".equalsIgnoreCase(sortDirection) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sort = Sort.by(dir, field);

        Page<Member> members = memberPort.findAll(status, role, provider, searchType, keyword,
                PageRequest.of(page - 1, size, sort));

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
    public void updateStatus(Long requesterId, Long userId, String newStatus) {
        guardSelfAction(requesterId, userId, "자기 자신의 상태는 변경할 수 없습니다.");
        guardAdminTarget(userId, "관리자 계정의 상태는 변경할 수 없습니다.");

        if (MemberStatus.SUSPENDED.equals(newStatus)) {
            memberPort.suspendMember(userId, AdminPolicy.SUSPENSION_DAYS);
        } else {
            memberPort.updateStatus(userId, newStatus);
        }
    }

    /* ── 관리자 강제 탈퇴 ── */
    @Override
    @Transactional
    public void deleteMember(Long requesterId, Long userId) {
        guardSelfAction(requesterId, userId, "자기 자신은 강제 탈퇴할 수 없습니다.");
        guardAdminTarget(userId, "관리자 계정은 강제 탈퇴할 수 없습니다.");

        // 1. 관리자 강제 탈퇴 시 상태를 DELETED 체제로 변경 (트리거 발동)
        memberPort.updateStatus(userId, MemberStatus.DELETED);
        
        // 2. 공용 삭제 도메인의 오케스트레이터 호출 (실제 물리 파괴 수행)
        forceDeleteUserUseCase.execute(userId);
    }

    /*
     * ── 역할 변경 (USER ↔ ADMIN) ──
     * role 변경은 DB에는 즉시 반영되지만 JWT에는 즉시 반영되지 않는다.
     * 해당 회원이 재로그인 또는 Refresh Token을 갱신한 이후에 적용된다.
     */
    @Override
    @Transactional
    public void updateRole(Long requesterId, Long userId, String newRole) {
        guardSelfAction(requesterId, userId, "자기 자신의 권한은 변경할 수 없습니다.");
        guardAdminTarget(userId, "관리자 계정의 권한은 변경할 수 없습니다.");

        memberPort.updateRole(userId, newRole);
    }

    /* ══════════════════════════════════════════════
     *  인가 가드 (자기 자신 차단 / 관리자 보호)
     * ══════════════════════════════════════════════ */

    /**
     * 요청자가 대상과 같은 경우 차단
     */
    private void guardSelfAction(Long requesterId, Long targetId, String message) {
        if (requesterId != null && requesterId.equals(targetId)) {
            throw new IllegalArgumentException(message);
        }
    }

    /**
     * 대상 회원이 ADMIN인 경우 차단
     * (현재 단계에서는 슈퍼 관리자 개념 없이, 관리자 계정 자체를 보호)
     */
    private void guardAdminTarget(Long targetId, String message) {
        memberPort.findById(targetId).ifPresent(target -> {
            if (Role.ADMIN.name().equals(target.getRole())) {
                throw new IllegalArgumentException(message);
            }
        });
    }

    /* ── Domain → Result 변환 ── */
    private MemberItem toItem(Member m) {
        return MemberItem.builder()
                .userId(m.getUserId())
                .loginId(m.getLoginId())
                .provider(resolveProvider(m.getLoginId()))
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

    /**
     * loginId prefix로 가입 방식(provider) 추론
     * - "kakao_xxx" → KAKAO
     * - "naver_xxx" → NAVER
     * - 그 외 → LOCAL (일반 이메일 가입)
     */
    private String resolveProvider(String loginId) {
        if (loginId == null) return "LOCAL";
        if (loginId.startsWith("kakao_")) return "KAKAO";
        if (loginId.startsWith("naver_")) return "NAVER";
        if (loginId.startsWith("google_")) return "GOOGLE";
        return "LOCAL";
    }
}
