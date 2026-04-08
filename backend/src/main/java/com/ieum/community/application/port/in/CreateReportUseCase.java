package com.ieum.community.application.port.in;

import com.ieum.community.domain.model.Report;

public interface CreateReportUseCase {
    Report createReport(String targetType, Long targetId, String reason, String description, Long reporterId);
}
