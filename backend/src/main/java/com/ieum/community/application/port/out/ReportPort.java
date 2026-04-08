package com.ieum.community.application.port.out;

import com.ieum.community.domain.model.Report;

import java.util.List;
import java.util.Optional;

public interface ReportPort {
    Report save(Report report);
    Optional<Report> findByReporterIdAndTargetTypeAndTargetId(Long reporterId, String targetType, Long targetId);
    List<Long> findTargetIdsByReporterIdAndTargetTypeAndStatusIn(Long reporterId, String targetType, List<String> statuses);
}
