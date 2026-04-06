package com.ieum.admin.report.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 신고 도메인 모델 (순수 객체 — JPA Entity 아님)
 */
@Getter
@Builder
public class Report {
    private Long id;
    private String targetType;      // REVIEW, POST, COMMENT
    private Long targetId;
    private String reason;           // SPAM, ABUSE, FALSE_INFO, ETC
    private String description;
    private String status;           // PENDING, RESOLVED, REJECTED
    private String action;           // DELETE, DISMISS, NONE
    private String adminNote;
    private Long reporterId;
    private String reporterNickname;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;
}
