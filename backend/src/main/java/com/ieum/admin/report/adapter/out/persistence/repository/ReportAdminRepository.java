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

    /* ── 전체 조회 (닉네임 포함) ── */
    @Query("SELECT r, u.nickname FROM ReportEntity r LEFT JOIN com.ieum.admin.report.adapter.out.persistence.entity.UserRef u ON u.id = r.reporterId ORDER BY r.createdAt DESC")
    Page<Object[]> findAllWithNickname(Pageable pageable);

    /* ── 상태 필터 ── */
    @Query("SELECT r, u.nickname FROM ReportEntity r LEFT JOIN com.ieum.admin.report.adapter.out.persistence.entity.UserRef u ON u.id = r.reporterId WHERE r.status = :status ORDER BY r.createdAt DESC")
    Page<Object[]> findByStatusWithNickname(@Param("status") String status, Pageable pageable);

    /* ── 대상 타입 필터 ── */
    @Query("SELECT r, u.nickname FROM ReportEntity r LEFT JOIN com.ieum.admin.report.adapter.out.persistence.entity.UserRef u ON u.id = r.reporterId WHERE r.targetType = :targetType ORDER BY r.createdAt DESC")
    Page<Object[]> findByTargetTypeWithNickname(@Param("targetType") String targetType, Pageable pageable);

    /* ── 상태 + 대상 타입 필터 ── */
    @Query("SELECT r, u.nickname FROM ReportEntity r LEFT JOIN com.ieum.admin.report.adapter.out.persistence.entity.UserRef u ON u.id = r.reporterId WHERE r.status = :status AND r.targetType = :targetType ORDER BY r.createdAt DESC")
    Page<Object[]> findByStatusAndTargetTypeWithNickname(@Param("status") String status, @Param("targetType") String targetType, Pageable pageable);

    long countByStatus(String status);
}
