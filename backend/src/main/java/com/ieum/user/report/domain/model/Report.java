package com.ieum.user.report.domain.model;

import com.ieum.global.common.enums.ReportStatus;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 신고 도메인 모델 (순수 자바 객체)
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Report {
    // --- 신고 대상 유형 상수 ---
    public static final String TARGET_POST = "POST";
    public static final String TARGET_COMMENT = "COMMENT";
    public static final String TARGET_REVIEW = "REVIEW";

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
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;

    public void updateForRejection(String reason, String description) {
        this.status = ReportStatus.PENDING.name();
        this.reason = reason;
        this.description = description;
        this.createdAt = LocalDateTime.now();
        this.action = null;
        this.adminNote = null;
        this.processedAt = null;
    }
}
