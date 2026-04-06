package com.ieum.admin.report.application.port.in;

/**
 * 신고 처리 (승인/반려) UseCase
 * - message: 관리자 답변 (필수)
 */
public interface ProcessReportUseCase {
    void processReport(Long reportId, String action, String message);
}
