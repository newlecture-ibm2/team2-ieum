package com.ieum.admin.report.application.port.in;

import java.util.Map;

/**
 * 신고 대상 원문 커리 UseCase
 */
public interface GetReportTargetUseCase {
    Map<String, String> getOriginalContent(Long reportId);
}
