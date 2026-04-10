package com.ieum.user.report.adapter.in.web.dto;

import com.ieum.user.report.domain.model.Report;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ReportResponse {
    private Long id;
    private Long reporterId;
    private String targetType;
    private Long targetId;
    private Long targetParentId;
    private String reason;
    private String description;
    private String status;
    private String action;
    private String adminNote;
    private LocalDateTime processedAt;
    private LocalDateTime createdAt;

    public static ReportResponse fromDomain(Report report) {
        return ReportResponse.builder()
                .id(report.getId())
                .reporterId(report.getReporterId())
                .targetType(report.getTargetType())
                .targetId(report.getTargetId())
                .targetParentId(report.getTargetParentId())
                .reason(report.getReason())
                .description(report.getDescription())
                .status(report.getStatus())
                .action(report.getAction())
                .adminNote(report.getAdminNote())
                .processedAt(report.getProcessedAt())
                .createdAt(report.getCreatedAt())
                .build();
    }
}
