package com.ieum.admin.member.adapter.out.persistence.repository;

import com.ieum.admin.member.adapter.out.persistence.entity.MemberEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

/**
 * 회원 관리용 JPA Repository
 * - users 테이블 기반 동적 검색
 * - 신고 당한 횟수는 PersistenceAdapter에서 별도 집계
 */
public interface MemberAdminRepository extends JpaRepository<MemberEntity, Long> {

    /**
     * 동적 검색 쿼리 (필터: 상태, 역할, 검색어)
     */
    @Query("SELECT u FROM MemberEntity u " +
           "WHERE (:status IS NULL OR :status = '' OR u.status = :status) " +
           "AND (:role IS NULL OR :role = '' OR u.role = :role) " +
           "AND (:keyword IS NULL OR :keyword = '' OR " +
           "  ((:searchType IS NULL OR :searchType = 'ALL' OR :searchType = '') AND " +
           "    (u.name LIKE CONCAT('%', :keyword, '%') OR u.nickname LIKE CONCAT('%', :keyword, '%') OR u.loginId LIKE CONCAT('%', :keyword, '%'))) OR " +
           "  (:searchType = 'NAME' AND u.name LIKE CONCAT('%', :keyword, '%')) OR " +
           "  (:searchType = 'NICKNAME' AND u.nickname LIKE CONCAT('%', :keyword, '%')) OR " +
           "  (:searchType = 'LOGIN_ID' AND u.loginId LIKE CONCAT('%', :keyword, '%'))" +
           ") " +
           "ORDER BY u.createdAt DESC")
    Page<MemberEntity> findMembersByConditions(@Param("status") String status,
                                                @Param("role") String role,
                                                @Param("searchType") String searchType,
                                                @Param("keyword") String keyword,
                                                Pageable pageable);

    long countByStatus(String status);

    long countByRole(String role);

    /**
     * 정지 해제 대상 일괄 업데이트 (Bulk Update)
     * - status = SUSPENDED AND suspended_until <= cutoff
     * - status → ACTIVE, suspended_until → null, updated_at → now
     * - JPQL은 Java 상수를 직접 참조할 수 없으므로 파라미터로 주입
     * @return 업데이트된 행 수
     */
    @Modifying(clearAutomatically = true)
    @Query("UPDATE MemberEntity u SET u.status = :activeStatus, u.suspendedUntil = null, u.updatedAt = :now " +
           "WHERE u.status = :suspendedStatus AND u.suspendedUntil IS NOT NULL AND u.suspendedUntil <= :cutoff")
    int bulkReleaseSuspendedMembers(@Param("cutoff") LocalDateTime cutoff,
                                    @Param("now") LocalDateTime now,
                                    @Param("suspendedStatus") String suspendedStatus,
                                    @Param("activeStatus") String activeStatus);
}
