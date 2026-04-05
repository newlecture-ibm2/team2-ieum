package com.ieum.admin.report.application.service;

import com.ieum.admin.report.application.port.in.GetReportListUseCase;
import com.ieum.admin.report.application.port.in.ProcessReportUseCase;
import com.ieum.admin.report.application.port.out.ReportPort;
import com.ieum.admin.report.application.result.ReportItem;
import com.ieum.admin.report.application.result.ReportListResult;
import com.ieum.admin.report.domain.model.Report;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 신고 관리 서비스 (UseCase 구현체)
 * - Port 인터페이스만 의존
 * - Entity 직접 사용 금지
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportAdminService implements GetReportListUseCase, ProcessReportUseCase {

    private final ReportPort reportPort;

    @Override
    public ReportListResult getReports(int page, int size, String status, String targetType) {
        Page<Report> reports = reportPort.findAll(status, targetType, PageRequest.of(page - 1, size));

        return ReportListResult.builder()
                .content(reports.getContent().stream().map(this::toItem).toList())
                .totalPages(reports.getTotalPages())
                .totalElements(reports.getTotalElements())
                .pendingCount(reportPort.countByStatus("PENDING"))
                .resolvedCount(reportPort.countByStatus("RESOLVED"))
                .rejectedCount(reportPort.countByStatus("REJECTED"))
                .build();
    }

    @Override
    @Transactional
    public void processReport(Long reportId, String action, String adminNote) {
        String newStatus = "DISMISS".equalsIgnoreCase(action) ? "REJECTED" : "RESOLVED";
        reportPort.updateStatus(reportId, newStatus, action, adminNote);
    }

    private ReportItem toItem(Report r) {
        return ReportItem.builder()
                .id(r.getId())
                .targetType(r.getTargetType())
                .targetId(r.getTargetId())
                .reason(r.getReason())
                .description(r.getDescription())
                .status(r.getStatus())
                .reporterNickname(r.getReporterNickname())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
