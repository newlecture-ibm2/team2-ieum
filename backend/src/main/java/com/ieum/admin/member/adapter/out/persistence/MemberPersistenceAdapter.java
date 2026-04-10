package com.ieum.admin.member.adapter.out.persistence;

import com.ieum.admin.member.adapter.out.persistence.entity.MemberEntity;
import com.ieum.admin.member.adapter.out.persistence.repository.MemberAdminRepository;
import com.ieum.admin.member.application.port.out.MemberPort;
import com.ieum.admin.member.domain.model.Member;
import com.ieum.admin.member.domain.model.MemberStatus;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 회원 Persistence Adapter (OutPort 구현체)
 *
 * <p>admin 전용 Entity(MemberEntity)만 사용한다.
 * user/auth의 UserJpaEntity를 import하거나 참조하지 않는다.</p>
 *
 * <p>users 테이블을 admin/member, user/auth, admin/report 3곳에서 각각의 Entity로 매핑한다.
 * 동일 테이블에 대한 동시 쓰기는 컬럼 단위로 역할 분리하여 충돌을 방지한다.</p>
 */
@Component
@RequiredArgsConstructor
public class MemberPersistenceAdapter implements MemberPort {

    private final MemberAdminRepository repository;
    private final EntityManager em;

    /**
     * 회원 목록 조회 (페이지 단위)
     * - 신고 횟수는 IN 절 기반 일괄 집계로 N+1 방지
     * - 쿼리 수: 목록 1회 + 신고 집계 1회 = 총 2회
     */
    @Override
    public Page<Member> findAll(String status, String role, String provider, String searchType, String keyword, Pageable pageable) {
        Page<MemberEntity> page = repository.findMembersByConditions(status, role, provider, searchType, keyword, pageable);
        List<Member> members = page.getContent().stream()
                .map(MemberEntity::toDomain)
                .toList();
        return new PageImpl<>(members, pageable, page.getTotalElements());
    }

    /**
     * 회원 상세 조회 (단건)
     */
    @Override
    public Optional<Member> findById(Long userId) {
        return repository.findById(userId).map(MemberEntity::toDomain);
    }

    @Override
    public void updateStatus(Long userId, String status) {
        repository.findById(userId).ifPresent(entity -> {
            entity.setStatus(status);
            if (MemberStatus.ACTIVE.equalsIgnoreCase(status)) {
                entity.setSuspendedUntil(null); // 정지 해제 시 해제일 초기화
            }
            if (MemberStatus.DELETED.equalsIgnoreCase(status)) {
                entity.setDeletedAt(LocalDateTime.now());
            }
            repository.save(entity);
        });
    }

    @Override
    public void suspendMember(Long userId, int days) {
        repository.findById(userId).ifPresent(entity -> {
            entity.setStatus(MemberStatus.SUSPENDED);
            entity.setSuspendedUntil(LocalDateTime.now().plusDays(days));
            repository.save(entity);
        });
    }

    /**
     * 역할 변경 (USER ↔ ADMIN)
     * <p>주의: DB role은 즉시 반영되지만 JWT에는 즉시 반영되지 않는다.
     * 해당 회원이 재로그인하거나 Refresh Token을 갱신해야 새 권한이 적용된다.</p>
     */
    @Override
    public void updateRole(Long userId, String role) {
        repository.findById(userId).ifPresent(entity -> {
            entity.setRole(role);
            entity.setUpdatedAt(LocalDateTime.now());
            repository.save(entity);
        });
    }

    /**
     * 관리자 강제 탈퇴 (status → DELETED)
     * <p>주의: user/auth의 자발적 탈퇴(WITHDRAWAL)와 의미가 다르다.
     * DELETED와 WITHDRAWAL의 로그인 차단 정책 통합은 user/auth 담당자와 협의 필요.</p>
     */
    @Override
    public void deleteMember(Long userId) {
        repository.findById(userId).ifPresent(entity -> {
            repository.delete(entity);
        });
    }

    @Override
    public long countByStatus(String status) {
        return repository.countByStatus(status);
    }

    @Override
    public long countByRole(String role) {
        return repository.countByRole(role);
    }

    @Override
    public long countAll() {
        return repository.count();
    }

    /**
     * 정지 해제 대상 일괄 업데이트 (배치 스케줄러용)
     * - JPQL Bulk Update로 성능 최적화
     * - MemberStatus 상수를 파라미터로 전달하여 하드코딩 방지
     */
    @Override
    public int releaseSuspendedMembers(LocalDateTime cutoff) {
        LocalDateTime now = LocalDateTime.now();
        return repository.bulkReleaseSuspendedMembers(
                cutoff, now, MemberStatus.SUSPENDED, MemberStatus.ACTIVE);
    }

    @Override
    public int deletePhysicalMember(Long userId) {
        return repository.deletePhysicalMember(userId);
    }

    @Override
    public void increaseReportedCount(Long userId) {
        repository.increaseReportedCount(userId);
    }
}

