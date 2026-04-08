package com.ieum.community.adapter.out.persistence.repository;

import com.ieum.admin.report.adapter.out.persistence.entity.ReportEntity;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 사용자 신고용 Repository
 * - 중복 신고 체크 (UK: reporter_id + target_type + target_id)
 */
public interface ReportRepository extends JpaRepository<ReportEntity, Long> {

    boolean existsByReporterIdAndTargetTypeAndTargetId(Long reporterId, String targetType, Long targetId);

    java.util.List<ReportEntity> findByReporterIdOrderByCreatedAtDesc(Long reporterId);

    java.util.Optional<ReportEntity> findByIdAndReporterId(Long id, Long reporterId);
}
