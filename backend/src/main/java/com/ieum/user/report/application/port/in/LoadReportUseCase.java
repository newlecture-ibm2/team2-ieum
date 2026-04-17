package com.ieum.user.report.application.port.in;

import com.ieum.user.report.domain.model.Report;

import java.util.List;

public interface LoadReportUseCase {
    boolean isAlreadyReported(Long reporterId, String targetType, Long targetId);
    List<Long> getMyReportedTargetIds(Long reporterId, String targetType);
    List<Report> getMyReports(Long reporterId);
    Report getReportDetail(Long reportId, Long reporterId);
}
