package com.ieum.user.report.application.port.in;

import java.util.List;

public interface LoadReportUseCase {
    boolean isAlreadyReported(Long reporterId, String targetType, Long targetId);
    List<Long> getMyReportedTargetIds(Long reporterId, String targetType);
}
