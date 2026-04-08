package com.ieum.community.domain.model;

import lombok.*;

import java.time.LocalDateTime;

/**
 * 신고 도메인 모델 (순수 자바 객체)
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Report {
    private Long id;
    private Long reporterId;
    private String targetType;
    private Long targetId;
    private String reason;
    private String description;
    private String status;
    private String action;
    private String adminNote;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;

    public void updateForRejection(String reason, String description) {
        this.status = "PENDING";
        this.reason = reason;
        this.description = description;
        this.createdAt = LocalDateTime.now();
        this.action = null;
        this.adminNote = null;
        this.processedAt = null;
    }
}
