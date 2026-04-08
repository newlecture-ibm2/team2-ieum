package com.ieum.community.adapter.out.persistence.repository;

import com.ieum.admin.report.adapter.out.persistence.entity.ReportEntity;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 사용자 신고용 Repository
 * - 중복 신고 체크 (UK: reporter_id + target_type + target_id)
 */
public interface ReportRepository extends JpaRepository<ReportEntity, Long> {

    boolean existsByReporterIdAndTargetTypeAndTargetId(Long reporterId, String targetType, Long targetId);

    java.util.Optional<ReportEntity> findByReporterIdAndTargetTypeAndTargetId(Long reporterId, String targetType, Long targetId);

    @org.springframework.data.jpa.repository.Query("SELECT r.targetId FROM ReportEntity r WHERE r.reporterId = :reporterId AND r.targetType = :targetType AND r.status IN :statuses")
    java.util.List<Long> findTargetIdsByReporterIdAndTargetTypeAndStatusIn(
            @org.springframework.data.repository.query.Param("reporterId") Long reporterId,
            @org.springframework.data.repository.query.Param("targetType") String targetType,
            @org.springframework.data.repository.query.Param("statuses") java.util.List<String> statuses);
}
