package com.ieum.user.report.application.port.out;

import com.ieum.user.report.domain.model.Report;

import java.util.List;
import java.util.Optional;

public interface ReportPort {
    Report save(Report report);
    Optional<Report> findByReporterIdAndTargetTypeAndTargetId(Long reporterId, String targetType, Long targetId);
    List<Long> findTargetIdsByReporterIdAndTargetTypeAndStatusIn(Long reporterId, String targetType, List<String> statuses);
    List<Report> findAllByReporterId(Long reporterId);
    Optional<Report> findByIdAndReporterId(Long id, Long reporterId);
}
