package com.ieum.admin.member.adapter.out.persistence.repository;

import com.ieum.admin.member.adapter.out.persistence.entity.MemberEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
}
