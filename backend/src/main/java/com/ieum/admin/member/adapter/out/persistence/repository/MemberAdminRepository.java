package com.ieum.admin.member.adapter.out.persistence.repository;

import com.ieum.admin.member.adapter.out.persistence.entity.MemberEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 회원 관리용 JPA Repository
 * - users 테이블 기반 동적 검색
 * - 신고 당한 횟수는 PersistenceAdapter에서 별도 집계
 */
public interface MemberAdminRepository extends JpaRepository<MemberEntity, Long> {

    /**
     * 동적 검색 쿼리 (필터: 상태, 역할, 가입 방식, 검색어)
     *
     * <p>provider 필터는 loginId prefix 기반으로 동작한다.
     * - KAKAO: loginId LIKE 'kakao_%'
     * - NAVER: loginId LIKE 'naver_%'
     * - GOOGLE: loginId LIKE 'google_%'
     * - LOCAL: loginId NOT LIKE 'kakao_%' AND NOT LIKE 'naver_%' AND NOT LIKE 'google_%'
     * </p>
     */
    @Query("SELECT u FROM MemberEntity u " +
           "WHERE (:status IS NULL OR :status = '' OR u.status = :status) " +
           "AND (:role IS NULL OR :role = '' OR u.role = :role) " +
           "AND (:provider IS NULL OR :provider = '' " +
           "  OR (:provider = 'KAKAO' AND u.loginId LIKE 'kakao_%') " +
           "  OR (:provider = 'NAVER' AND u.loginId LIKE 'naver_%') " +
           "  OR (:provider = 'GOOGLE' AND u.loginId LIKE 'google_%') " +
           "  OR (:provider = 'LOCAL' AND u.loginId NOT LIKE 'kakao_%' AND u.loginId NOT LIKE 'naver_%' AND u.loginId NOT LIKE 'google_%') " +
           ") " +
           "AND (:keyword IS NULL OR :keyword = '' OR " +
           "  ((:searchType IS NULL OR :searchType = 'ALL' OR :searchType = '') AND " +
           "    (u.name LIKE CONCAT('%', :keyword, '%') OR u.nickname LIKE CONCAT('%', :keyword, '%') OR u.loginId LIKE CONCAT('%', :keyword, '%'))) OR " +
           "  (:searchType = 'NAME' AND u.name LIKE CONCAT('%', :keyword, '%')) OR " +
           "  (:searchType = 'NICKNAME' AND u.nickname LIKE CONCAT('%', :keyword, '%')) OR " +
           "  (:searchType = 'LOGIN_ID' AND u.loginId LIKE CONCAT('%', :keyword, '%'))" +
           ") ")
    Page<MemberEntity> findMembersByConditions(@Param("status") String status,
                                                @Param("role") String role,
                                                @Param("provider") String provider,
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

    /**
     * 일정 기한이 경과한 WITHDRAWAL 탈퇴 유예자 조회
     * - status = 'WITHDRAWAL' AND updatedAt <= cutoff
     */
    @Query("SELECT u.userId FROM MemberEntity u WHERE u.status = :status AND u.updatedAt <= :cutoff")
    List<Long> findMemberIdsByStatusAndUpdatedAtBefore(@Param("status") String status, @Param("cutoff") LocalDateTime cutoff);

    /**
     * 특정 상태(예: DELETED)로 남아있는 잔여 유저 ID 조회
     */
    @Query("SELECT u.userId FROM MemberEntity u WHERE u.status = :status")
    List<Long> findMemberIdsByStatus(@Param("status") String status);

    /**
     * 회원(users) 테이블을 대상으로 한 완전한 물리 삭제
     * - 예외 발생을 방지하기 위해 벌크 연산으로 멱등성을 보장합니다.
     */
    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM MemberEntity u WHERE u.userId = :userId")
    int deletePhysicalMember(@Param("userId") Long userId);

    /**
     * 관리자가 신고를 '처리 완료(승인)' 할 때, 피신고자(해당 회원의) 신고수를 +1 증가
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE MemberEntity m SET m.reportedCount = COALESCE(m.reportedCount, 0) + 1 WHERE m.userId = :userId")
    int increaseReportedCount(@Param("userId") Long userId);
}
