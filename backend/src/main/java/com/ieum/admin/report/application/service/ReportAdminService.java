package com.ieum.admin.report.application.service;

import com.ieum.admin.common.constant.AdminPolicy;
import com.ieum.admin.report.application.port.in.GetReportListUseCase;
import com.ieum.admin.report.application.port.in.ProcessReportUseCase;
import com.ieum.admin.report.application.port.out.ReportPort;
import com.ieum.admin.report.application.result.ReportItem;
import com.ieum.admin.report.application.result.ReportListResult;
import com.ieum.admin.report.domain.model.Report;
import com.ieum.global.common.enums.NotificationType;
import com.ieum.global.common.enums.ReportAction;
import com.ieum.global.common.enums.ReportStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ieum.admin.report.application.port.in.GetReportTargetUseCase;
import com.ieum.user.notification.application.port.in.SendNotificationUseCase;
import com.ieum.admin.member.application.port.out.MemberPort;

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
    private final MemberPort memberPort;
    private final SendNotificationUseCase sendNotificationUseCase;
    @Override
    public ReportListResult getReports(int page, int size, String status, String targetType, String searchType,
            String keyword) {
        Page<Report> reports = reportPort.findAll(status, targetType, searchType, keyword,
                PageRequest.of(page - 1, size));

        return ReportListResult.builder()
                .content(reports.getContent().stream().map(this::toItem).toList())
                .totalPages(reports.getTotalPages())
                .totalElements(reports.getTotalElements())
                .pendingCount(reportPort.countByStatus(ReportStatus.PENDING.name()))
                .resolvedCount(reportPort.countByStatus(ReportStatus.RESOLVED.name()))
                .rejectedCount(reportPort.countByStatus(ReportStatus.REJECTED.name()))
                .build();
    }

    @Override
    @Transactional
    public void processReport(Long reportId, String action, String message) {
        Report currentReport = reportPort.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 신고입니다."));

        if (!ReportStatus.PENDING.name().equals(currentReport.getStatus())) {
            throw new IllegalStateException("이미 처리된 신고입니다.");
        }

        // 프론트엔드 액션을 DB Enum 타입(report_action)에 맞게 변환 (PostgreSQL ENUM 제약조건 해결)
        String dbAction = getDbAction(action);

        String newStatus = ReportAction.DISMISS.name().equalsIgnoreCase(action) ? ReportStatus.REJECTED.name() : ReportStatus.RESOLVED.name();
        
        reportPort.updateStatus(reportId, newStatus, dbAction, message);
        // 답변 저장 (adminId는 추후 인증 연동 시 주입, 현재는 null)
        reportPort.saveResponse(reportId, null, dbAction, message);

        if (ReportAction.DELETE.name().equalsIgnoreCase(action) || AdminPolicy.DB_ACTION_DELETE_CONTENT.equalsIgnoreCase(action)) {
            hideTargetContent(reportId);
        }

        // 신고가 승인(조치)되었을 경우 피신고자의 신고수를 +1 증가
        if (ReportStatus.RESOLVED.name().equals(newStatus)) {
            reportPort.findById(reportId).ifPresent(report -> {
                Long authorId = reportPort.findTargetAuthorId(report.getTargetType(), report.getTargetId());
                if (authorId != null) {
                    memberPort.increaseReportedCount(authorId);
                }
            });
        }

        // 처리 완료 후 신고자에게 결과 알림 전송
        reportPort.findById(reportId).ifPresent(report -> {
            if (report.getReporterId() != null) {
                try {
                    String title = "회원님의 신고 처리 결과 안내";
                    String notifyMessage = ReportStatus.RESOLVED.name().equals(newStatus) 
                            ? "신고가 정상 처리(완료)되었습니다." 
                            : "신고가 반려(미조치)되었습니다.";
                    
                    if (message != null && !message.isEmpty()) {
                        notifyMessage += " - " + (message.length() > 20 ? message.substring(0, 20) + "..." : message);
                    }

                    sendNotificationUseCase.sendNotification(
                            report.getReporterId(),
                            NotificationType.NOTICE.name(),  // 공지와 유사한 시스템 알림 타입으로 분류 (아이콘 표시용)
                            report.getTargetType(), // REVIEW, POST, COMMENT 등
                            report.getTargetId(),
                            title,
                            notifyMessage
                    );
                } catch (Exception e) {
                    // 알림 실패 무시
                }
            }
        });
    }

    private void hideTargetContent(Long reportId) {
        reportPort.findById(reportId).ifPresent(report -> {
            reportPort.hideTargetContent(report.getTargetType(), report.getTargetId());
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


    private String getDbAction(String frontendAction) {
        if (ReportAction.DELETE.name().equalsIgnoreCase(frontendAction)) {
            return AdminPolicy.DB_ACTION_DELETE_CONTENT;
        } else if (ReportAction.SUSPEND.name().equalsIgnoreCase(frontendAction) || ReportAction.WARNING.name().equalsIgnoreCase(frontendAction)) {
            return AdminPolicy.DB_ACTION_WARN_USER;
        } else {
            return AdminPolicy.DB_ACTION_NONE;
        }
    }
}
