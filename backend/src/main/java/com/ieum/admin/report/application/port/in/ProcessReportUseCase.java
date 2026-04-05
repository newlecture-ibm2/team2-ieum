package com.ieum.admin.report.application.port.in;

/**
 * 신고 처리 (승인/반려) UseCase
 */
public interface ProcessReportUseCase {
    void processReport(Long reportId, String action, String adminNote);
}
