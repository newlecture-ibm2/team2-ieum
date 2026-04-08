package com.ieum.admin.report.application.port.in;

import com.ieum.admin.report.application.result.ReportListResult;

/**
 * 신고 목록 조회 UseCase
 */
public interface GetReportListUseCase {
    ReportListResult getReports(int page, int size, String status, String targetType, String searchType, String keyword);
}
