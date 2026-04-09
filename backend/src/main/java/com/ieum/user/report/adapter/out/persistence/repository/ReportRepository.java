package com.ieum.user.report.adapter.out.persistence.repository;

import com.ieum.user.report.adapter.out.persistence.entity.UserReportEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * 사용자 신고 Repository (통합 — POST, COMMENT, REVIEW 공통)
 * - 중복 신고 체크
 * - 내가 신고한 대상 ID 조회
 */
public interface ReportRepository extends JpaRepository<UserReportEntity, Long> {

    boolean existsByReporterIdAndTargetTypeAndTargetId(Long reporterId, String targetType, Long targetId);

    Optional<UserReportEntity> findByReporterIdAndTargetTypeAndTargetId(Long reporterId, String targetType, Long targetId);

    @Query("SELECT r.targetId FROM UserReportEntity r WHERE r.reporterId = :reporterId AND r.targetType = :targetType AND r.status IN :statuses")
    List<Long> findTargetIdsByReporterIdAndTargetTypeAndStatusIn(
            @Param("reporterId") Long reporterId,
            @Param("targetType") String targetType,
            @Param("statuses") List<String> statuses);

    List<UserReportEntity> findAllByReporterIdOrderByCreatedAtDesc(Long reporterId);

    Optional<UserReportEntity> findByIdAndReporterId(Long id, Long reporterId);
}
