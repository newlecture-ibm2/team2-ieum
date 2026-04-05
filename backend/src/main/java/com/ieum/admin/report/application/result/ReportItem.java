package com.ieum.admin.report.application.result;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 신고 목록 아이템 Result DTO (Domain 기반)
 */
@Getter
@Builder
public class ReportItem {
    private Long id;
    private String targetType;
    private Long targetId;
    private String reason;
    private String description;
    private String status;
    private String reporterNickname;
    private LocalDateTime createdAt;
}
