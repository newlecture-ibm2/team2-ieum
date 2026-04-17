package com.ieum.user.report.application.port.in;

import com.ieum.user.report.domain.model.Report;

public interface CreateReportUseCase {
    Report createReport(String targetType, Long targetId, String reason, String description, Long reporterId);
}
