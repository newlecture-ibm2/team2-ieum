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

import com.ieum.admin.report.application.port.in.GetReportTargetUseCase;

import jakarta.persistence.EntityManager;

/**
 * 신고 관리 서비스 (UseCase 구현체)
 * - Port 인터페이스만 의존
 * - Entity 직접 사용 금지
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportAdminService implements GetReportListUseCase, ProcessReportUseCase, GetReportTargetUseCase {

    private final ReportPort reportPort;
    private final EntityManager em;

    @Override
    public ReportListResult getReports(int page, int size, String status, String targetType, String searchType,
            String keyword) {
        Page<Report> reports = reportPort.findAll(status, targetType, searchType, keyword,
                PageRequest.of(page - 1, size));

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
    public void processReport(Long reportId, String action, String message) {
        String newStatus = "DISMISS".equalsIgnoreCase(action) ? "REJECTED" : "RESOLVED";
        reportPort.updateStatus(reportId, newStatus, action, message);
        // 답변 저장 (adminId는 추후 인증 연동 시 주입, 현재는 null)
        reportPort.saveResponse(reportId, null, action, message);

        if ("DELETE".equalsIgnoreCase(action)) {
            hideTargetContent(reportId);
        }
    }

    private void hideTargetContent(Long reportId) {
        reportPort.findById(reportId).ifPresent(report -> {
            String type = report.getTargetType();
            Long id = report.getTargetId();

            if ("POST".equalsIgnoreCase(type)) {
                // TODO: 커뮤니티 파트 - PostEntity에 ERD 명세대로 status(ACTIVE/REMOVED) 컬럼이 추가되면 아래 주석 해제 요망
                // em.createQuery("UPDATE PostEntity p SET p.status = 'REMOVED' WHERE p.id = :id")
                //        .setParameter("id", id)
                //        .executeUpdate();
            } else if ("COMMENT".equalsIgnoreCase(type)) {
                em.createQuery("UPDATE CommentEntity c SET c.status = 'REMOVED' WHERE c.id = :id")
                        .setParameter("id", id)
                        .executeUpdate();
            } else if ("REVIEW".equalsIgnoreCase(type)) {
                // TODO: 리뷰 파트 - ReviewEntity에 ERD 명세대로 status(ACTIVE/REMOVED) 컬럼이 추가되면 아래 주석 해제 요망
                // em.createQuery("UPDATE ReviewEntity r SET r.status = 'REMOVED' WHERE r.id = :id")
                //        .setParameter("id", id)
                //        .executeUpdate();
            }
        });
    }

    private ReportItem toItem(Report r) {
        return ReportItem.builder()
                .id(r.getId())
                .targetType(r.getTargetType())
                .targetId(r.getTargetId())
                .reason(r.getReason())
                .description(r.getDescription())
                .status(r.getStatus())
                .action(r.getAction())
                .adminNote(r.getAdminNote())
                .reporterNickname(r.getReporterNickname())
                .createdAt(r.getCreatedAt())
                .processedAt(r.getProcessedAt())
                .build();
    }

    @Override
    public java.util.Map<String, String> getOriginalContent(Long reportId) {
        return reportPort.findById(reportId)
                .map(r -> reportPort.findOriginalContent(r.getTargetType(), r.getTargetId()))
                .orElse(null);
    }
}
