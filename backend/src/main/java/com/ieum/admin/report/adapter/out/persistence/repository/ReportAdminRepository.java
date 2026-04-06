package com.ieum.admin.report.adapter.out.persistence.repository;

import com.ieum.admin.report.adapter.out.persistence.entity.ReportEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * 신고 JPA Repository
 * - reports JOIN users 로 reporter 닉네임 가져오기
 */
public interface ReportAdminRepository extends JpaRepository<ReportEntity, Long> {

    /* ── 동적 검색 쿼리 ── */
    @Query("SELECT r, u.nickname FROM ReportEntity r " +
           "LEFT JOIN com.ieum.admin.report.adapter.out.persistence.entity.UserRef u ON u.id = r.reporterId " +
           "WHERE (:status IS NULL OR :status = '' OR r.status = :status) " +
           "AND (:targetType IS NULL OR :targetType = '' OR r.targetType = :targetType) " +
           "AND (:keyword IS NULL OR :keyword = '' OR " +
           "  ((:searchType IS NULL OR :searchType = 'ALL' OR :searchType = '') AND (r.description LIKE %:keyword% OR u.nickname LIKE %:keyword% OR r.reason LIKE %:keyword%)) OR " +
           "  (:searchType = 'REPORTER' AND u.nickname LIKE %:keyword%) OR " +
           "  (:searchType = 'DESCRIPTION' AND r.description LIKE %:keyword%) OR " +
           "  (:searchType = 'REASON' AND r.reason LIKE %:keyword%)" +
           ") " +
           "ORDER BY r.createdAt DESC")
    Page<Object[]> findReportsByConditions(@Param("status") String status,
                                           @Param("targetType") String targetType,
                                           @Param("searchType") String searchType,
                                           @Param("keyword") String keyword,
                                           Pageable pageable);

    long countByStatus(String status);
}
